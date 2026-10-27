const getServiceRootKey = ["services"] as const;
const getServiceTrainerAssignmentRootKey = [
  "service-trainer-assignments",
] as const;
const getServiceBoardAssignmentRootKey = ["service-board-assignments"] as const;

export const serviceKeys = {
  /** Everything for this organization's services */
  all: () => getServiceRootKey,
  /** One service and all its sub-keys */
  byId: (serviceId: string) => [...getServiceRootKey, serviceId] as const,
  /** All services assigned to a trainer */
  assignedToTrainer: (trainerId: string) =>
    [...getServiceRootKey, "assigned-to", "trainer", trainerId] as const,
  /** All services assigned to a board */
  assignedToBoard: (boardId: string) =>
    [...getServiceRootKey, "assigned-to", "board", boardId] as const,
};

export const serviceTrainerAssignmentKeys = {
  /** Everything for this organization's service trainer assignments */
  all: () => getServiceTrainerAssignmentRootKey,
  /** One service trainer assignment and all its sub-keys */
  byId: (serviceTrainerAssignmentId: string) =>
    [
      ...getServiceTrainerAssignmentRootKey,
      serviceTrainerAssignmentId,
    ] as const,
  /** All service trainer assignments for a trainer */
  byTrainer: (trainerId: string) =>
    [...getServiceTrainerAssignmentRootKey, "trainer", trainerId] as const,
  /** All service trainer assignments for a service */
  byService: (serviceId: string) =>
    [...getServiceTrainerAssignmentRootKey, "service", serviceId] as const,
};

export const serviceBoardAssignmentKeys = {
  /** Everything for this organization's service board assignments */
  all: () => getServiceBoardAssignmentRootKey,
  /** One service board assignment and all its sub-keys */
  byId: (serviceBoardAssignmentId: string) =>
    [...getServiceBoardAssignmentRootKey, serviceBoardAssignmentId] as const,
  /** All service board assignments for a board */
  byBoard: (boardId: string) =>
    [...getServiceBoardAssignmentRootKey, "board", boardId] as const,
  /** All service board assignments for a service */
  byService: (serviceId: string) =>
    [...getServiceBoardAssignmentRootKey, "service", serviceId] as const,
};
