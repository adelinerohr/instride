import {
  GuardianRelationshipStatus,
  MembershipRole,
  QuestionnaireQuestionOperator,
} from "@instride/shared";
import { APIError } from "encore.dev/api";
import { boards } from "~encore/clients";

import { db } from "@/database";

import { Member } from "../organizations/types/models";
import {
  Questionnaire,
  QuestionnaireQuestion,
  QuestionnaireQuestionResponse,
} from "./types/models";

export async function resolveSubjectMember({
  organizationId,
  authUserId,
  optionalSubjectUserId,
  callerMemberId,
}: {
  organizationId: string;
  authUserId: string;
  optionalSubjectUserId: string | undefined;
  callerMemberId: string;
}): Promise<Member> {
  if (!optionalSubjectUserId || optionalSubjectUserId === authUserId) {
    const self = await db.query.members.findFirst({
      where: { id: callerMemberId, organizationId },
    });
    if (!self) {
      throw APIError.notFound("Membership not found");
    }
    return self;
  }

  const target = await db.query.members.findFirst({
    where: { userId: optionalSubjectUserId, organizationId },
    with: {
      rider: true,
      trainer: true,
    },
  });
  if (!target) {
    throw APIError.notFound("Target user not found");
  }

  await assertMaySubmitForMember({
    organizationId,
    callerMemberId,
    targetMember: target,
  });

  return target;
}

function memberIsPlaceholder(target: { isPlaceholder?: boolean }): boolean {
  return Boolean(target.isPlaceholder);
}

async function assertMaySubmitForMember({
  organizationId,
  callerMemberId,
  targetMember,
}: {
  organizationId: string;
  callerMemberId: string;
  targetMember: Member;
}) {
  if (targetMember.id === callerMemberId) {
    return;
  }

  if (memberIsPlaceholder(targetMember)) {
    const caller = await db.query.members.findFirst({
      where: { id: callerMemberId, organizationId },
    });
    if (!caller) {
      throw APIError.permissionDenied(
        "Not authorized to submit questionnaire for this user"
      );
    }
    const isGuardian = caller.roles.includes(MembershipRole.GUARDIAN);
    if (!isGuardian) {
      throw APIError.permissionDenied(
        "Not authorized to submit questionnaire for this user"
      );
    }
    return;
  }

  const relationship = await db.query.guardianRelationships.findFirst({
    where: {
      guardianMemberId: callerMemberId,
      dependentMemberId: targetMember.id,
      organizationId,
      status: GuardianRelationshipStatus.ACTIVE,
    },
  });

  if (!relationship) {
    throw APIError.permissionDenied(
      "Not authorized to submit questionnaire for this user"
    );
  }
}

function responseMap(
  responses: QuestionnaireQuestionResponse[]
): Map<string, string | boolean> {
  return new Map(responses.map((r) => [r.questionId, r.responseValue]));
}

function isQuestionVisible(
  q: QuestionnaireQuestion,
  answers: Map<string, string | boolean>
): boolean {
  if (!q.showIf) {
    return true;
  }
  const parent = answers.get(q.showIf.questionId);
  return parent === q.showIf.responseValue;
}

export function validateResponses(
  responses: QuestionnaireQuestionResponse[],
  questionnaire: Questionnaire
): void {
  const answers = responseMap(responses);
  const questionById = new Map(questionnaire.questions.map((q) => [q.id, q]));

  for (const q of questionnaire.questions) {
    if (!isQuestionVisible(q, answers)) {
      continue;
    }
    if (!q.required) {
      continue;
    }
    if (!answers.has(q.id)) {
      throw APIError.invalidArgument(`Missing answer for question ${q.id}`);
    }
  }

  for (const r of responses) {
    const q = questionById.get(r.questionId);
    if (!q) {
      throw APIError.invalidArgument(`Unknown question ${r.questionId}`);
    }
    if (!isQuestionVisible(q, answers)) {
      throw APIError.invalidArgument(
        `Unexpected answer for hidden question ${r.questionId}`
      );
    }
  }
}

function conditionMatches(
  operator: QuestionnaireQuestionOperator,
  actual: string | boolean | undefined,
  expected: string | boolean
): boolean {
  if (actual === undefined) {
    return false;
  }
  if (operator === QuestionnaireQuestionOperator.EQUALS) {
    return actual === expected;
  }
  if (operator === QuestionnaireQuestionOperator.NOT_EQUALS) {
    return actual !== expected;
  }
  return false;
}

export function evaluateBoardAssignmentRules(
  questionnaire: Questionnaire,
  responses: QuestionnaireQuestionResponse[]
): string[] {
  const answers = responseMap(responses);
  const sorted = [...questionnaire.boardAssignmentRules].sort(
    (a, b) => b.priority - a.priority
  );

  const assigned = new Set<string>();
  for (const rule of sorted) {
    const allMatch = rule.conditions.every((c) =>
      conditionMatches(c.operator, answers.get(c.questionId), c.responseValue)
    );
    if (allMatch) {
      assigned.add(rule.boardId);
    }
  }

  if (assigned.size === 0 && questionnaire.defaultBoardId) {
    assigned.add(questionnaire.defaultBoardId);
  }

  return [...assigned];
}

export async function syncRiderBoardAssignments({
  riderId,
  boardIds,
}: {
  riderId: string;
  boardIds: string[];
}): Promise<void> {
  for (const boardId of boardIds) {
    try {
      await boards.assignToBoard({
        boardId,
        riderId,
      });
    } catch (err: unknown) {
      if (
        err &&
        typeof err === "object" &&
        "code" in err &&
        (err as { code?: string }).code === "already_exists"
      ) {
        continue;
      }
      throw err;
    }
  }
}
