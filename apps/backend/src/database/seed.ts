import { MembershipRole } from "@instride/shared";

import { auth as authClient } from "@/services/auth/auth";

import { db } from ".";
import { members, riders, trainers } from "./schema";

const users: {
  name: string;
  email: string;
  password: string;
  roles: MembershipRole[];
}[] = [
  {
    name: "Sarah Korenthal",
    email: "sarahk@testemail.com",
    password: "password123",
    roles: [MembershipRole.RIDER],
  },
  {
    name: "Becky Beavers",
    email: "becky@testemail.com",
    password: "password123",
    roles: [MembershipRole.RIDER, MembershipRole.ADMIN],
  },
  {
    name: "Sarah Brazell",
    email: "sarahb@testemail.com",
    password: "password123",
    roles: [MembershipRole.TRAINER],
  },
  {
    name: "Lisa Goldman",
    email: "lisag@testemail.com",
    password: "password123",
    roles: [MembershipRole.TRAINER, MembershipRole.ADMIN, MembershipRole.RIDER],
  },
];

async function seed() {
  console.log("🌱 Seeding database...");
  const authOrganizationId = "mjFopsRAXyu3Vg9UZjWoXWvubh6XCrhd";
  const organizationId = "e9ae2d21-3d77-4f11-a402-fc3c04f92e07";

  for (const user of users) {
    try {
      console.log(
        `🔑 Seeding ${user.name} with roles ${user.roles.join(", ")}...`
      );

      // 1. Create user in Better Auth
      let authUserId: string = "";

      const existingUser = await db.query.authUsers.findFirst({
        where: {
          email: user.email,
        },
      });

      if (existingUser) {
        authUserId = existingUser.id;
      } else {
        const authUser = await authClient.api.signUpEmail({
          body: {
            name: user.name,
            email: user.email,
            password: user.password,
          },
        });

        authUserId = authUser.user.id;
      }

      // 2. Create member in Better Auth
      let authMemberId: string = "";
      const existingAuthMember = await db.query.authMembers.findFirst({
        where: {
          userId: authUserId,
          organizationId: authOrganizationId,
        },
      });

      if (existingAuthMember) {
        authMemberId = existingAuthMember.id;
      } else {
        const authMember = await authClient.api.addMember({
          body: {
            userId: authUserId,
            organizationId: authOrganizationId,
            role: user.roles,
          },
        });

        authMemberId = authMember.id;
      }

      // 3. Create member in database
      let memberId: string = "";
      const existingMember = await db.query.members.findFirst({
        where: {
          userId: authUserId,
          organizationId: organizationId,
        },
      });

      if (existingMember) {
        memberId = existingMember.id;
      } else {
        const [member] = await db
          .insert(members)
          .values({
            userId: authUserId,
            organizationId: organizationId,
            authMemberId,
            roles: user.roles,
          })
          .returning();

        memberId = member.id;
      }

      // 4. Create trainer in database
      if (user.roles.includes(MembershipRole.TRAINER)) {
        const existingTrainer = await db.query.trainers.findFirst({
          where: {
            memberId,
          },
        });

        if (!existingTrainer) {
          await db.insert(trainers).values({ memberId, organizationId });
        }
      }

      // 5. Create rider in database
      if (user.roles.includes(MembershipRole.RIDER)) {
        const existingRider = await db.query.riders.findFirst({
          where: {
            memberId,
          },
        });

        if (!existingRider) {
          await db.insert(riders).values({ memberId, organizationId });
        }
      }

      console.log(`✅ Seeded ${user.name} (${user.roles.join(", ")})`);
    } catch (error) {
      throw Error(`Failed to seed user ${user.name}: ${error}`);
    }
  }
}

seed()
  .catch((error) => {
    console.error("Error seeding database:", error);
  })
  .finally(() => process.exit());
