import { TestHelpers } from "better-auth/plugins";
import { beforeAll, describe, expect, it, vi } from "vitest";
import * as auth from "~encore/auth";

import { auth as betterAuth } from "./auth";
import { updateUser } from "./routes";

describe("update current user", () => {
  let test: TestHelpers;

  beforeAll(async () => {
    const ctx = await betterAuth.$context;
    test = ctx.test;
  });

  it("should update the current user", async () => {
    const user = await test.createUser({
      name: "John Doe",
      email: "john.doe@example.com",
    });
    await test.saveUser(user);

    const spy = vi.spyOn(auth, "getAuthData");
    spy.mockImplementation(() => ({
      userID: user.id,
      email: user.email,
      role: "user",
    }));

    await updateUser({
      name: "Jane Doe",
    });

    const updatedUser = await betterAuth.api.getUser({
      query: {
        id: user.id,
      },
    });

    expect(updatedUser.name).toBe("Jane Doe");
  });
});
