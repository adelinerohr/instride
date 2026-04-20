import { defineRelationsPart } from "drizzle-orm/relations";

import * as schema from "@/database/schema";

export const organizationsRelations = defineRelationsPart(schema, (r) => ({
  // better auth tables
  authOrganizations: {
    // better auth relations
    authMembers: r.many.authMembers(),
    authInvitations: r.many.authInvitations(),
    // our own relations
    organizations: r.one.organizations({
      from: r.authOrganizations.id,
      to: r.organizations.authOrganizationId,
    }),
  },
  authMembers: {
    // better auth relations
    authOrganization: r.one.authOrganizations({
      from: r.authMembers.organizationId,
      to: r.authOrganizations.id,
    }),
    authUser: r.one.authUsers({
      from: r.authMembers.userId,
      to: r.authUsers.id,
    }),
    // our own relations
    member: r.one.members({
      from: r.authMembers.id,
      to: r.members.authMemberId,
    }),
  },
  authInvitations: {
    authOrganization: r.one.authOrganizations({
      from: r.authInvitations.organizationId,
      to: r.authOrganizations.id,
    }),
    inviter: r.one.authUsers({
      from: r.authInvitations.inviterId,
      to: r.authUsers.id,
    }),
  },

  // our tables
  organizations: {
    authOrganization: r.one.authOrganizations({
      from: r.organizations.id,
      to: r.authOrganizations.id,
    }),
    members: r.many.members({
      from: r.organizations.id,
      to: r.members.organizationId,
    }),
    boards: r.many.boards({
      from: r.organizations.id,
      to: r.boards.organizationId,
    }),
    services: r.many.services({
      from: r.organizations.id,
      to: r.services.organizationId,
    }),
    lessonSeries: r.many.lessonSeries({
      from: r.organizations.id,
      to: r.lessonSeries.organizationId,
    }),
    organizationAvailability: r.many.organizationAvailability({
      from: r.organizations.id,
      to: r.organizationAvailability.organizationId,
    }),
    questionnaires: r.many.questionnaires({
      from: r.organizations.id,
      to: r.questionnaires.organizationId,
    }),
    levels: r.many.levels({
      from: r.organizations.id,
      to: r.levels.organizationId,
    }),
    waivers: r.many.waivers({
      from: r.organizations.id,
      to: r.waivers.organizationId,
    }),
    waiverSignatures: r.many.waiverSignatures({
      from: r.organizations.id,
      to: r.waiverSignatures.organizationId,
    }),
    notifications: r.many.notifications({
      from: r.organizations.id,
      to: r.notifications.organizationId,
    }),
    notificationPreferences: r.many.notificationPreferences({
      from: r.organizations.id,
      to: r.notificationPreferences.organizationId,
    }),
    notificationPushTokens: r.many.notificationPushTokens({
      from: r.organizations.id,
      to: r.notificationPushTokens.organizationId,
    }),
    kioskSessions: r.many.kioskSessions({
      from: r.organizations.id,
      to: r.kioskSessions.organizationId,
    }),
    events: r.many.events({
      from: r.organizations.id,
      to: r.events.organizationId,
    }),
  },

  members: {
    authUser: r.one.authUsers({
      from: r.members.userId,
      to: r.authUsers.id,
    }),
    authMember: r.one.authMembers({
      from: r.members.authMemberId,
      to: r.authMembers.id,
    }),
    organization: r.one.organizations({
      from: r.members.organizationId,
      to: r.organizations.id,
    }),
    trainer: r.one.trainers({
      from: r.members.id,
      to: r.trainers.memberId,
    }),
    rider: r.one.riders({
      from: r.members.id,
      to: r.riders.memberId,
    }),
    timeBlocks: r.many.timeBlocks({
      from: r.members.id,
      to: r.timeBlocks.trainerId,
    }),
    feedPosts: r.many.feedPosts({
      from: r.members.id,
      to: r.feedPosts.authorMemberId,
    }),
    waiverSignatures: r.many.waiverSignatures({
      from: r.members.id,
      to: r.waiverSignatures.signerMemberId,
    }),
    onBehalfOfWaiverSignatures: r.many.waiverSignatures({
      from: r.members.id,
      to: r.waiverSignatures.onBehalfOfMemberId,
    }),
    notifications: r.many.notifications({
      from: r.members.id,
      to: r.notifications.recipientId,
    }),
    notificationPreferences: r.one.notificationPreferences({
      from: r.members.id,
      to: r.notificationPreferences.memberId,
    }),
    activityAsActor: r.many.activity({
      from: r.members.id,
      to: r.activity.actorMemberId,
    }),
    activityAsOwner: r.many.activity({
      from: r.members.id,
      to: r.activity.ownerMemberId,
    }),
    kioskSessions: r.many.kioskSessions({
      from: r.members.id,
      to: r.kioskSessions.actingMemberId,
    }),
    events: r.many.events({
      from: r.members.id,
      to: r.events.createdByMemberId,
    }),
    questionnaireResponses: r.many.questionnaireResponses({
      from: r.members.id,
      to: r.questionnaireResponses.submittedByMemberId,
    }),
  },

  trainers: {
    member: r.one.members({
      from: r.trainers.memberId,
      to: r.members.id,
    }),
    organization: r.one.organizations({
      from: r.trainers.organizationId,
      to: r.organizations.id,
    }),
    lessonSeries: r.many.lessonSeries({
      from: r.trainers.id,
      to: r.lessonSeries.trainerId,
    }),
    lessonInstances: r.many.lessonInstances({
      from: r.trainers.id,
      to: r.lessonInstances.trainerId,
    }),
    serviceAssignments: r.many.serviceTrainerAssignments({
      from: r.trainers.id,
      to: r.serviceTrainerAssignments.trainerId,
    }),
    availability: r.many.trainerAvailability({
      from: r.trainers.id,
      to: r.trainerAvailability.trainerId,
    }),
    timeBlocks: r.many.timeBlocks({
      from: r.trainers.id,
      to: r.timeBlocks.trainerId,
    }),
    boardAssignments: r.many.boardAssignments({
      from: r.trainers.id,
      to: r.boardAssignments.trainerId,
    }),
    eventsSchedulingBlocks: r.many.eventSchedulingBlocks({
      from: r.trainers.id,
      to: r.eventSchedulingBlocks.trainerId,
    }),
  },

  riders: {
    member: r.one.members({
      from: r.riders.memberId,
      to: r.members.id,
    }),
    organization: r.one.organizations({
      from: r.riders.organizationId,
      to: r.organizations.id,
    }),
    level: r.one.levels({
      from: r.riders.ridingLevelId,
      to: r.levels.id,
    }),
    boardAssignments: r.many.boardAssignments({
      from: r.riders.id,
      to: r.boardAssignments.riderId,
    }),
    seriesEnrollments: r.many.lessonSeriesEnrollments({
      from: r.riders.id,
      to: r.lessonSeriesEnrollments.riderId,
    }),
    instanceEnrollments: r.many.lessonInstanceEnrollments({
      from: r.riders.id,
      to: r.lessonInstanceEnrollments.riderId,
    }),
    waivers: r.many.waivers({
      from: r.riders.memberId,
      to: r.waivers.organizationId,
    }),
    questionnaire: r.one.questionnaireResponses({
      from: r.riders.memberId,
      to: r.questionnaireResponses.memberId,
    }),
    guardianRelationshipsAsGuardian: r.many.guardianRelationships({
      from: r.riders.memberId,
      to: r.guardianRelationships.guardianMemberId,
    }),
    guardianRelationshipsAsDependent: r.many.guardianRelationships({
      from: r.riders.memberId,
      to: r.guardianRelationships.dependentMemberId,
    }),
  },

  levels: {
    organization: r.one.organizations({
      from: r.levels.organizationId,
      to: r.organizations.id,
    }),
  },
}));
