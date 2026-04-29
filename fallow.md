## Health Score: 73 (B)

## Vital Signs

| Metric                | Value |
| :-------------------- | ----: |
| Total LOC             | 44892 |
| Avg Cyclomatic        |   2.0 |
| P90 Cyclomatic        |     4 |
| Dead Files            |  6.8% |
| Dead Exports          | 18.0% |
| Maintainability (avg) |  89.2 |
| Hotspots              |     0 |
| Circular Deps         |    24 |
| Unused Deps           |     3 |

## Fallow: 229 high complexity functions

| File                                                                                                 | Function                             | Severity | Cyclomatic | Cognitive | CRAP        | Lines |
| :--------------------------------------------------------------------------------------------------- | :----------------------------------- | :------- | :--------- | :-------- | :---------- | :---- |
| `apps/web/src/features/calendar/components/modals/event-modal.tsx:48`                                | `EventModalForm`                     | critical | 29 **!**   | 15        | 870.0 **!** | 254   |
| `apps/web/src/features/calendar/components/views/fragments/lesson-block.tsx:69`                      | `LessonBlock`                        | critical | 23 **!**   | 19 **!**  | 552.0 **!** | 162   |
| `apps/web/src/features/organization/components/business-hours/tabs.tsx:55`                           | `BusinessHoursTabs`                  | critical | 22 **!**   | 22 **!**  | 506.0 **!** | 211   |
| `apps/web/src/features/chat/components/conversation/bubble.tsx:16`                                   | `MessageBubble`                      | critical | 20         | 16 **!**  | 420.0 **!** | 72    |
| `apps/web/src/shared/components/data-table/toolbar/index.tsx:127`                                    | `onFilterRender`                     | critical | 20         | 13        | 420.0 **!** | 61    |
| `apps/web/src/features/lessons/components/modals/new-lesson/index.tsx:94`                            | `onSubmitInvalid`                    | critical | 19         | 24 **!**  | 380.0 **!** | 53    |
| `apps/web/src/shared/hooks/use-file-upload.ts:170`                                                   | `addFiles`                           | critical | 19         | 22 **!**  | 380.0 **!** | 94    |
| `apps/web/src/routes/org/$slug/(non-member)/route.tsx:17`                                            | `beforeLoad`                         | critical | 18         | 16 **!**  | 342.0 **!** | 63    |
| `apps/web/src/shared/components/form/choice-card-field.tsx:184`                                      | `<arrow>`                            | critical | 18         | 15        | 342.0 **!** | 58    |
| `apps/web/src/features/lessons/components/modals/view-lesson/portal-actions.tsx:20`                  | `PortalActions`                      | critical | 17         | 8         | 306.0 **!** | 139   |
| `apps/web/src/routes/auth/callback.tsx:26`                                                           | `handleCallback`                     | critical | 16         | 16 **!**  | 272.0 **!** | 55    |
| `apps/web/src/features/calendar/components/modals/time-block-form.tsx:60`                            | `TimeBlockModalForm`                 | critical | 16         | 12        | 272.0 **!** | 171   |
| `apps/web/src/features/lessons/components/fragments/lesson-card/detail.tsx:24`                       | `LessonCardDetail`                   | critical | 16         | 13        | 272.0 **!** | 132   |
| `apps/web/src/features/chat/hooks/use-parties.ts:25`                                                 | `useParties`                         | critical | 16         | 14        | 272.0 **!** | 87    |
| `apps/web/src/routes/org/$slug/(authenticated)/portal/route.tsx:64`                                  | `beforeLoad`                         | critical | 16         | 13        | 272.0 **!** | 103   |
| `apps/web/src/features/organization/components/feed/post/index.tsx:17`                               | `Post`                               | critical | 15         | 12        | 240.0 **!** | 121   |
| `apps/web/src/shared/components/form/choice-card-field.tsx:85`                                       | `<arrow>`                            | critical | 15         | 12        | 240.0 **!** | 58    |
| `apps/web/src/shared/components/form/variants/password-field.tsx:28`                                 | `PasswordField`                      | critical | 14         | 12        | 210.0 **!** | 86    |
| `apps/web/src/features/onboarding/components/modals/add-dependent.tsx:47`                            | `AddDependentModal`                  | critical | 14         | 11        | 210.0 **!** | 242   |
| `apps/web/src/shared/components/form/clearable-select-field.tsx:38`                                  | `ClearableSelectField`               | critical | 14         | 12        | 210.0 **!** | 79    |
| `apps/web/src/routes/org/$slug/(authenticated)/route.tsx:15`                                         | `beforeLoad`                         | critical | 14         | 12        | 210.0 **!** | 47    |
| `apps/web/src/shared/components/ui/time-picker.tsx:76`                                               | `handleKeyDown`                      | critical | 14         | 14        | 210.0 **!** | 26    |
| `apps/web/src/routes/org/$slug/(authenticated)/portal/index.tsx:78`                                  | `RouteComponent`                     | critical | 13         | 12        | 182.0 **!** | 231   |
| `apps/web/src/features/lessons/components/modals/new-lesson/details.tsx:35`                          | `render`                             | critical | 13         | 11        | 182.0 **!** | 149   |
| `apps/web/src/features/kiosk/components/lessons/actions.tsx:19`                                      | `LessonsActions`                     | critical | 13         | 9         | 182.0 **!** | 102   |
| `apps/web/src/features/organization/components/members/profile/rider/overview/index.tsx:27`          | `RiderOverview`                      | critical | 13         | 6         | 182.0 **!** | 87    |
| `apps/web/src/features/chat/utils/grouping.ts:15`                                                    | `<arrow>`                            | critical | 13         | 9         | 182.0 **!** | 39    |
| `apps/web/src/shared/components/form/select-field.tsx:40`                                            | `SelectField`                        | critical | 13         | 11        | 182.0 **!** | 71    |
| `apps/web/src/features/lessons/components/modals/new-lesson/scheduling.tsx:24`                       | `render`                             | critical | 13         | 7         | 182.0 **!** | 127   |
| `apps/web/src/routes/org/$slug/(authenticated)/portal/lessons/create.tsx:110`                        | `onSubmit`                           | critical | 12         | 11        | 156.0 **!** | 70    |
| `apps/web/src/routes/(authenticated)/admin/route.tsx:68`                                             | `RouteComponent`                     | critical | 12         | 11        | 156.0 **!** | 43    |
| `apps/web/src/features/chat/components/conversation/lesson-attachment/card.tsx:255`                  | `SettledFooter`                      | critical | 12         | 11        | 156.0 **!** | 46    |
| `apps/web/src/features/organization/components/guardians/controls-modal.tsx:42`                      | `GuardianControlsModalForm`          | critical | 12         | 10        | 156.0 **!** | 82    |
| `apps/web/src/shared/components/form/variants/rider-select-field.tsx:197`                            | `ClearableSingleSelectField`         | critical | 12         | 10        | 156.0 **!** | 51    |
| `apps/web/src/shared/lib/utils/data-table.ts:4`                                                      | `getColumnPinningStyle`              | critical | 12         | 14        | 156.0 **!** | 30    |
| `apps/web/src/routes/org/$slug/(authenticated)/settings/organization/members/-invitations.tsx:141`   | `MemberRow`                          | critical | 12         | 6         | 156.0 **!** | 161   |
| `apps/web/src/features/onboarding/components/wizard.tsx:52`                                          | `<arrow>`                            | critical | 12         | 10        | 156.0 **!** | 46    |
| `apps/web/src/features/organization/components/questionnaires/question-builder.tsx:30`               | `render`                             | critical | 12         | 6         | 156.0 **!** | 242   |
| `apps/web/src/routes/org/$slug/(authenticated)/portal/lessons/create.tsx:68`                         | `RouteComponent`                     | critical | 11         | 11        | 132.0 **!** | 382   |
| `apps/web/src/routes/org/$slug/(authenticated)/portal/lessons/-booking-calendar.tsx:116`             | `<arrow>`                            | critical | 11         | 9         | 132.0 **!** | 161   |
| `apps/web/src/routes/(authenticated)/admin/route.tsx:51`                                             | `loader`                             | critical | 11         | 10        | 132.0 **!** | 15    |
| `apps/web/src/features/chat/components/conversation/lesson-attachment/card.tsx:43`                   | `LessonAttachmentCard`               | critical | 11         | 9         | 132.0 **!** | 144   |
| `apps/web/src/shared/components/fragments/user-avatar.tsx:16`                                        | `UserAvatar`                         | critical | 11         | 4         | 132.0 **!** | 24    |
| `apps/web/src/shared/components/form/text-field.tsx:24`                                              | `TextField`                          | critical | 11         | 10        | 132.0 **!** | 61    |
| `apps/web/src/features/lessons/hooks/use-lesson-data.ts:27`                                          | `useLessonCardData`                  | critical | 11         | 11        | 132.0 **!** | 39    |
| `apps/web/src/features/lessons/lib/new-lesson.form.ts:28`                                            | `buildLessonDefaultValues`           | critical | 11         | 12        | 132.0 **!** | 43    |
| `apps/web/src/shared/components/form/variants/trainer-select-field.tsx:198`                          | `ClearableSingleSelectField`         | critical | 11         | 9         | 132.0 **!** | 54    |
| `apps/web/src/routes/org/$slug/(non-member)/onboarding.tsx:75`                                       | `RouteComponent`                     | critical | 11         | 8         | 132.0 **!** | 267   |
| `apps/web/src/features/lessons/components/modals/view-lesson/index.tsx:40`                           | `ViewLessonModalForm`                | critical | 11         | 7         | 132.0 **!** | 89    |
| `apps/web/src/features/lessons/components/form/create/booking-calendar.tsx:31`                       | `BookingCalendar`                    | critical | 11         | 11        | 132.0 **!** | 245   |
| `apps/web/src/routes/__root.tsx:23`                                                                  | `beforeLoad`                         | critical | 11         | 6         | 132.0 **!** | 61    |
| `apps/web/src/routes/org/$slug/(authenticated)/admin/index.tsx:84`                                   | `RouteComponent`                     | critical | 11         | 11        | 132.0 **!** | 250   |
| `apps/web/src/shared/hooks/use-file-upload.ts:82`                                                    | `validateFile`                       | critical | 10         | 17 **!**  | 110.0 **!** | 34    |
| `apps/web/src/features/organization/components/levels/modal.tsx:38`                                  | `LevelModalForm`                     | critical | 10         | 5         | 110.0 **!** | 105   |
| `apps/web/src/features/calendar/components/views/fragments/hour-cell.tsx:33`                         | `handleClick`                        | critical | 10         | 9         | 110.0 **!** | 39    |
| `apps/web/src/shared/components/form/datetime-field.tsx:47`                                          | `handleTimeChange`                   | critical | 10         | 11        | 110.0 **!** | 23    |
| `apps/web/src/features/organization/components/feed/post/comment-item.tsx:39`                        | `CommentItem`                        | critical | 10         | 7         | 110.0 **!** | 71    |
| `apps/web/src/routes/org/$slug/(non-member)/onboarding.tsx:167`                                      | `onSubmit`                           | critical | 10         | 10        | 110.0 **!** | 54    |
| `apps/web/src/features/calendar/components/header/index.tsx:33`                                      | `getVisibility`                      | critical | 10         | 14        | 110.0 **!** | 21    |
| `apps/web/src/shared/components/form/variants/service-select-field.tsx:87`                           | `ClearableServiceSelectField`        | critical | 10         | 8         | 110.0 **!** | 50    |
| `apps/web/src/features/organization/components/feed/post/header.tsx:33`                              | `PostHeader`                         | critical | 10         | 6         | 110.0 **!** | 55    |
| `apps/web/src/shared/components/ui/file-upload.tsx:29`                                               | `AvatarUpload`                       | high     | 9          | 9         | 90.0 **!**  | 212   |
| `apps/web/src/shared/components/data-table/toolbar/sort-list.tsx:124`                                | `onKeyDown`                          | high     | 9          | 6         | 90.0 **!**  | 19    |
| `apps/web/src/features/calendar/utils/date.ts:40`                                                    | `navigateDate`                       | high     | 9          | 9         | 90.0 **!**  | 24    |
| `apps/web/src/features/organization/components/waivers/waiver-modal.tsx:38`                          | `WaiverModalForm`                    | high     | 9          | 5         | 90.0 **!**  | 97    |
| `apps/web/src/shared/components/data-table/toolbar/date-filter.tsx:125`                              | `label`                              | high     | 9          | 10        | 90.0 **!**  | 47    |
| `apps/web/src/shared/components/layout/user-dropdown.tsx:24`                                         | `UserDropdown`                       | high     | 9          | 6         | 90.0 **!**  | 120   |
| `apps/web/src/features/organization/components/business-hours/tabs.tsx:204`                          | `<arrow>`                            | high     | 9          | 8         | 90.0 **!**  | 58    |
| `apps/web/src/shared/components/layout/app-layout.tsx:18`                                            | `AppLayout`                          | high     | 9          | 6         | 90.0 **!**  | 22    |
| `apps/web/src/features/onboarding/components/modals/add-dependent.tsx:109`                           | `onSubmit`                           | high     | 9          | 13        | 90.0 **!**  | 45    |
| `apps/web/src/features/organization/components/members/list/card.tsx:19`                             | `MemberCard`                         | high     | 9          | 6         | 90.0 **!**  | 82    |
| `apps/web/src/shared/hooks/use-data-table.ts:25`                                                     | `useDataTable`                       | high     | 9          | 6         | 90.0 **!**  | 193   |
| `apps/web/src/features/lessons/components/modals/view-lesson/riders-list.tsx:22`                     | `RidersList`                         | high     | 9          | 5         | 90.0 **!**  | 87    |
| `apps/web/src/shared/components/data-table/column-header.tsx:27`                                     | `DataTableColumnHeader`              | high     | 9          | 8         | 90.0 **!**  | 73    |
| `apps/web/src/features/lessons/components/modals/new-lesson/riders.tsx:22`                           | `render`                             | high     | 8          | 4         | 72.0 **!**  | 60    |
| `apps/web/src/routes/org/$slug/(authenticated)/portal/lessons/create.tsx:385`                        | `<arrow>`                            | high     | 8          | 6         | 72.0 **!**  | 56    |
| `apps/web/src/features/lessons/components/modals/new-lesson/index.tsx:147`                           | `onSubmit`                           | high     | 8          | 14        | 72.0 **!**  | 64    |
| `apps/web/src/features/lessons/components/modals/new-lesson/index.tsx:78`                            | `LessonModalForm`                    | high     | 8          | 6         | 72.0 **!**  | 321   |
| `apps/web/src/shared/components/data-table/toolbar/faceted-filter.tsx:32`                            | `DataTableFacetedFilter`             | high     | 8          | 5         | 72.0 **!**  | 158   |
| `apps/web/src/features/calendar/components/views/fragments/multi-day-row/index.tsx:175`              | `<arrow>`                            | high     | 8          | 8         | 72.0 **!**  | 54    |
| `apps/web/src/features/calendar/components/header/filters.tsx:24`                                    | `CalendarFilters`                    | high     | 8          | 7         | 72.0 **!**  | 155   |
| `apps/web/src/routes/org/$slug/(authenticated)/admin/feed.tsx:39`                                    | `RouteComponent`                     | high     | 8          | 8         | 72.0 **!**  | 71    |
| `apps/web/src/features/organization/components/feed/filters.tsx:164`                                 | `<arrow>`                            | high     | 8          | 3         | 72.0 **!**  | 22    |
| `apps/web/src/features/organization/components/levels/level-badge.tsx:11`                            | `LevelBadge`                         | high     | 8          | 4         | 72.0 **!**  | 12    |
| `apps/web/src/shared/components/data-table/toolbar/date-filter.tsx:83`                               | `onSelect`                           | high     | 8          | 8         | 72.0 **!**  | 14    |
| `apps/web/src/shared/components/form/variants/rider-select-field.tsx:87`                             | `SingleSelectField`                  | high     | 8          | 7         | 72.0 **!**  | 44    |
| `apps/web/src/features/chat/components/sidebar.tsx:34`                                               | `ChatLayout`                         | high     | 8          | 5         | 72.0 **!**  | 148   |
| `apps/web/src/features/lessons/components/form/riders.tsx:159`                                       | `<arrow>`                            | high     | 8          | 4         | 72.0 **!**  | 25    |
| `apps/web/src/routes/org/$slug/(authenticated)/portal/feed.tsx:37`                                   | `RouteComponent`                     | high     | 8          | 8         | 72.0 **!**  | 67    |
| `apps/web/src/features/chat/components/conversation-item.tsx:17`                                     | `ConversationItem`                   | high     | 8          | 6         | 72.0 **!**  | 44    |
| `apps/web/src/features/chat/components/conversation/list.tsx:55`                                     | `renderMessageContent`               | high     | 8          | 5         | 72.0 **!**  | 56    |
| `apps/web/src/features/organization/components/questionnaires/rule-builder.tsx:141`                  | `<arrow>`                            | high     | 8          | 7         | 72.0 **!**  | 25    |
| `apps/web/src/features/calendar/hooks/use-calendar.tsx:149`                                          | `<arrow>`                            | high     | 8          | 5         | 72.0 **!**  | 28    |
| `apps/web/src/features/lessons/components/form/create/index.tsx:80`                                  | `CreateLesson`                       | high     | 8          | 4         | 72.0 **!**  | 238   |
| `apps/web/src/shared/components/ui/sidebar.tsx:150`                                                  | `Sidebar`                            | high     | 8          | 7         | 72.0 **!**  | 101   |
| `apps/web/src/features/calendar/components/views/fragments/multi-day-row/item.tsx:47`                | `MultiDayRowItem`                    | high     | 8          | 5         | 72.0 **!**  | 57    |
| `apps/web/src/features/organization/components/feed/composer.tsx:31`                                 | `PostComposer`                       | high     | 8          | 3         | 72.0 **!**  | 116   |
| `apps/web/src/routes/org/$slug/(authenticated)/admin/members/riders/$riderId.tsx:47`                 | `RouteComponent`                     | high     | 7          | 6         | 56.0 **!**  | 121   |
| `apps/web/src/features/kiosk/components/header.tsx:16`                                               | `KioskHeader`                        | high     | 7          | 8         | 56.0 **!**  | 90    |
| `apps/web/src/shared/components/confirmation-modal.tsx:27`                                           | `<arrow>`                            | high     | 7          | 6         | 56.0 **!**  | 30    |
| `apps/web/src/shared/components/form/variants/password-field.tsx:40`                                 | `getRequirements`                    | high     | 7          | 8         | 56.0 **!**  | 23    |
| `apps/web/src/features/onboarding/components/steps/personal-details.tsx:111`                         | `onSubmit`                           | high     | 7          | 6         | 56.0 **!**  | 17    |
| `apps/web/src/features/lessons/components/form/information.tsx:35`                                   | `render`                             | high     | 7          | 4         | 56.0 **!**  | 122   |
| `apps/web/src/features/onboarding/components/steps/questionnaire.tsx:48`                             | `<arrow>`                            | high     | 7          | 8         | 56.0 **!**  | 29    |
| `apps/web/src/features/organization/components/members/invitation-card.tsx:39`                       | `onAnswer`                           | high     | 7          | 10        | 56.0 **!**  | 30    |
| `apps/web/src/features/organization/utils/questionnaire.ts:9`                                        | `<arrow>`                            | high     | 7          | 6         | 56.0 **!**  | 9     |
| `apps/web/src/shared/components/data-table/toolbar/sort-list.tsx:51`                                 | `DataTableSortList`                  | high     | 7          | 6         | 56.0 **!**  | 213   |
| `apps/web/src/shared/lib/search/table.ts:40`                                                         | `<arrow>`                            | high     | 7          | 6         | 56.0 **!**  | 13    |
| `apps/web/src/routes/org/$slug/(authenticated)/settings/account/guardian.tsx:97`                     | `RouteComponent`                     | high     | 7          | 6         | 56.0 **!**  | 196   |
| `apps/web/src/features/calendar/hooks/use-range-swipe.tsx:80`                                        | `onPointerMove`                      | high     | 7          | 6         | 56.0 **!**  | 19    |
| `apps/web/src/features/calendar/hooks/use-range-swipe.tsx:103`                                       | `onPointerUp`                        | high     | 7          | 6         | 56.0 **!**  | 24    |
| `apps/web/src/shared/components/form/variants/trainer-select-field.tsx:86`                           | `SingleSelectField`                  | high     | 7          | 6         | 56.0 **!**  | 47    |
| `apps/web/src/routes/(authenticated)/create-organization.tsx:34`                                     | `RouteComponent`                     | high     | 7          | 5         | 56.0 **!**  | 197   |
| `apps/web/src/routes/org/$slug/(non-member)/onboarding.tsx:96`                                       | `completeOnboarding`                 | high     | 7          | 6         | 56.0 **!**  | 67    |
| `apps/web/src/features/lessons/components/form/riders.tsx:192`                                       | `<arrow>`                            | high     | 7          | 3         | 56.0 **!**  | 24    |
| `apps/web/src/shared/hooks/use-hot-key.ts:14`                                                        | `handler`                            | high     | 7          | 4         | 56.0 **!**  | 11    |
| `apps/web/src/features/organization/components/activity/enrollment.tsx:37`                           | `EnrollmentActivity`                 | high     | 7          | 6         | 56.0 **!**  | 64    |
| `apps/web/src/features/lessons/components/modals/view-lesson/lesson-details.tsx:18`                  | `LessonDetails`                      | high     | 7          | 4         | 56.0 **!**  | 59    |
| `apps/web/src/routes/org/$slug/(authenticated)/admin/members/$id.index.tsx:25`                       | `RouteComponent`                     | high     | 7          | 4         | 56.0 **!**  | 66    |
| `apps/web/src/features/lessons/components/fragments/lesson-card/date-chip.tsx:13`                    | `LessonCardDateChip`                 | high     | 7          | 4         | 56.0 **!**  | 55    |
| `apps/web/src/features/onboarding/lib/member/questionnaire.schema.ts:37`                             | `<arrow>`                            | high     | 7          | 5         | 56.0 **!**  | 28    |
| `apps/web/src/features/organization/components/members/profile/rider/tabs/lessons.tsx:30`            | `<arrow>`                            | high     | 7          | 2         | 56.0 **!**  | 16    |
| `apps/web/src/main.tsx:49`                                                                           | `input`                              | high     | 7          | 7         | 56.0 **!**  | 21    |
| `apps/web/src/shared/hooks/use-file-upload.ts:142`                                                   | `<arrow>`                            | high     | 7          | 5         | 56.0 **!**  | 25    |
| `apps/web/src/features/calendar/components/modals/event-modal.tsx:82`                                | `onSubmit`                           | high     | 7          | 10        | 56.0 **!**  | 49    |
| `apps/web/src/features/calendar/utils/multi-day.ts:8`                                                | `getMultiDayLayout`                  | high     | 7          | 5         | 56.0 **!**  | 29    |
| `apps/web/src/shared/components/form/choice-card-field.tsx:55`                                       | `MultiChoiceCardField`               | high     | 7          | 6         | 56.0 **!**  | 93    |
| `apps/web/src/shared/components/form/choice-card-field.tsx:149`                                      | `BooleanChoiceCardField`             | high     | 7          | 6         | 56.0 **!**  | 98    |
| `apps/web/src/shared/components/ui/field.tsx:182`                                                    | `content`                            | high     | 7          | 3         | 56.0 **!**  | 26    |
| `apps/web/src/shared/components/form/textarea-field.tsx:14`                                          | `TextareaField`                      | moderate | 6          | 5         | 42.0 **!**  | 29    |
| `apps/web/src/shared/components/form/radio-field.tsx:26`                                             | `BooleanRadioField`                  | moderate | 6          | 5         | 42.0 **!**  | 55    |
| `apps/web/src/features/lessons/components/modals/new-lesson/index.tsx:286`                           | `combine`                            | moderate | 6          | 5         | 42.0 **!**  | 8     |
| `apps/web/src/features/lessons/lib/portal-lesson.form.ts:28`                                         | `buildPortalLessonDefaultValues`     | moderate | 6          | 5         | 42.0 **!**  | 27    |
| `apps/web/src/routes/org/$slug/(authenticated)/portal/lessons/-booking-calendar.tsx:177`             | `<arrow>`                            | moderate | 6          | 5         | 42.0 **!**  | 29    |
| `apps/web/src/shared/components/data-table/toolbar/faceted-filter.tsx:46`                            | `onItemSelect`                       | moderate | 6          | 10        | 42.0 **!**  | 17    |
| `apps/web/src/features/calendar/components/views/fragments/multi-day-row/index.tsx:143`              | `<arrow>`                            | moderate | 6          | 4         | 42.0 **!**  | 9     |
| `apps/web/src/features/chat/components/conversation/lesson-proposal-modal.tsx:66`                    | `initialTrainerId`                   | moderate | 6          | 5         | 42.0 **!**  | 16    |
| `apps/web/src/features/calendar/components/index.tsx:12`                                             | `Calendar`                           | moderate | 6          | 5         | 42.0 **!**  | 20    |
| `apps/web/src/shared/components/data-table/toolbar/sort-list.tsx:65`                                 | `<arrow>`                            | moderate | 6          | 6         | 42.0 **!**  | 21    |
| `apps/web/src/shared/components/data-table/toolbar/sort-list.tsx:291`                                | `onItemKeyDown`                      | moderate | 6          | 5         | 42.0 **!**  | 17    |
| `apps/web/src/shared/components/form/datetime-field.tsx:151`                                         | `<arrow>`                            | moderate | 6          | 5         | 42.0 **!**  | 17    |
| `apps/web/src/shared/components/form/datetime-field.tsx:22`                                          | `DatetimeField`                      | moderate | 6          | 5         | 42.0 **!**  | 156   |
| `apps/web/src/routes/(authenticated)/admin/-columns.tsx:331`                                         | `cell`                               | moderate | 6          | 5         | 42.0 **!**  | 78    |
| `apps/web/src/shared/components/fragments/user-avatar.tsx:41`                                        | `UserAvatarItem`                     | moderate | 6          | 5         | 42.0 **!**  | 30    |
| `apps/web/src/shared/components/data-table/toolbar/date-filter.tsx:30`                               | `parseColumnFilterValue`             | moderate | 6          | 5         | 42.0 **!**  | 20    |
| `apps/web/src/shared/components/data-table/toolbar/date-filter.tsx:117`                              | `formatDateRange`                    | moderate | 6          | 5         | 42.0 **!**  | 7     |
| `apps/web/src/routes/org/$slug/(authenticated)/admin/services/$id.index.tsx:167`                     | `<arrow>`                            | moderate | 6          | 2         | 42.0 **!**  | 20    |
| `apps/web/src/features/organization/components/feed/post/comment-item.tsx:141`                       | `CommentBody`                        | moderate | 6          | 3         | 42.0 **!**  | 118   |
| `apps/web/src/shared/components/form/variants/rider-select-field.tsx:132`                            | `MultiSelectField`                   | moderate | 6          | 5         | 42.0 **!**  | 64    |
| `apps/web/src/features/chat/components/sidebar.tsx:45`                                               | `groupedConversations`               | moderate | 6          | 7         | 42.0 **!**  | 40    |
| `apps/web/src/routes/org/$slug/(authenticated)/settings/account/security/-connected-accounts.tsx:49` | `<arrow>`                            | moderate | 6          | 5         | 42.0 **!**  | 33    |
| `apps/web/src/routes/org/$slug/(authenticated)/settings/account/profile/-details.tsx:41`             | `onSubmit`                           | moderate | 6          | 6         | 42.0 **!**  | 64    |
| `apps/web/src/features/onboarding/components/modals/add-dependent.tsx:65`                            | `completeDependentOnboarding`        | moderate | 6          | 5         | 42.0 **!**  | 41    |
| `apps/web/src/shared/components/layout/settings-page.tsx:13`                                         | `SettingsPage`                       | moderate | 6          | 6         | 42.0 **!**  | 103   |
| `apps/web/src/routes/(authenticated)/create-organization.tsx:42`                                     | `completeOnboarding`                 | moderate | 6          | 6         | 42.0 **!**  | 63    |
| `apps/web/src/routes/(authenticated)/create-organization.tsx:109`                                    | `onSubmit`                           | moderate | 6          | 6         | 42.0 **!**  | 37    |
| `apps/web/src/shared/components/ui/sortable.tsx:359`                                                 | `SortableOverlay`                    | moderate | 6          | 6         | 42.0 **!**  | 37    |
| `apps/web/src/shared/hooks/use-file-upload.ts:280`                                                   | `<arrow>`                            | moderate | 6          | 2         | 42.0 **!**  | 20    |
| `apps/web/src/shared/hooks/use-file-upload.ts:343`                                                   | `handleDrop`                         | moderate | 6          | 6         | 42.0 **!**  | 20    |
| `apps/web/src/shared/lib/utils/format.ts:71`                                                         | `formatDate`                         | moderate | 6          | 5         | 42.0 **!**  | 17    |
| `apps/web/src/features/organization/components/members/profile/overview.tsx:12`                      | `MemberOverview`                     | moderate | 6          | 1         | 42.0 **!**  | 51    |
| `apps/web/src/features/organization/lib/board.form.ts:25`                                            | `buildBoardDefaultValues`            | moderate | 6          | 3         | 42.0 **!**  | 16    |
| `apps/web/src/features/organization/components/feed/post/comment-sheet.tsx:40`                       | `PostComments`                       | moderate | 6          | 5         | 42.0 **!**  | 122   |
| `apps/web/src/features/lessons/components/form/create/index.tsx:298`                                 | `<arrow>`                            | moderate | 6          | 2         | 42.0 **!**  | 13    |
| `apps/web/src/routes/org/$slug/(authenticated)/admin/boards/$id.index.tsx:123`                       | `<arrow>`                            | moderate | 6          | 2         | 42.0 **!**  | 20    |
| `apps/web/src/shared/components/form/variants/service-select-field.tsx:43`                           | `SingleServiceSelectField`           | moderate | 6          | 5         | 42.0 **!**  | 43    |
| `apps/web/src/features/lessons/lib/utils.ts:61`                                                      | `findNearestLesson`                  | moderate | 6          | 7         | 42.0 **!**  | 19    |
| `apps/web/src/features/kiosk/components/act-as-modal.tsx:45`                                         | `onSubmit`                           | moderate | 6          | 11        | 42.0 **!**  | 29    |
| `apps/web/src/features/organization/components/questionnaires/question-builder.tsx:207`              | `<arrow>`                            | moderate | 6          | 3         | 42.0 **!**  | 21    |
| `apps/web/src/shared/components/ui/phone-input.tsx:49`                                               | `PhoneInput`                         | moderate | 6          | 5         | 42.0 **!**  | 39    |
| `apps/web/src/shared/components/ui/time-picker.tsx:63`                                               | `calculateNewValue`                  | moderate | 6          | 5         | 42.0 **!**  | 12    |
| `apps/web/src/features/lessons/components/modals/view-lesson/riders-list.tsx:65`                     | `<arrow>`                            | moderate | 6          | 4         | 42.0 **!**  | 40    |
| `apps/web/src/routes/org/$slug/(authenticated)/portal/index.tsx:102`                                 | `renderGreeting`                     | moderate | 5          | 9         | 30.0 **!**  | 26    |
| `apps/web/src/routes/org/$slug/(authenticated)/portal/lessons/-booking-calendar.tsx:90`              | `<arrow>`                            | moderate | 5          | 3         | 30.0 **!**  | 190   |
| `apps/web/src/shared/components/form/switch-field.tsx:16`                                            | `SwitchField`                        | moderate | 5          | 4         | 30.0 **!**  | 27    |
| `apps/web/src/routes/org/$slug/(authenticated)/kiosk/$sessionId/calendar.tsx:81`                     | `RouteComponent`                     | moderate | 5          | 6         | 30.0 **!**  | 63    |
| `apps/web/src/features/onboarding/components/steps/questionnaire.tsx:178`                            | `onSubmit`                           | moderate | 5          | 4         | 30.0 **!**  | 10    |
| `apps/web/src/features/onboarding/components/steps/questionnaire.tsx:189`                            | `<arrow>`                            | moderate | 5          | 4         | 30.0 **!**  | 47    |
| `apps/web/src/features/onboarding/components/steps/questionnaire.tsx:128`                            | `<arrow>`                            | moderate | 5          | 3         | 30.0 **!**  | 112   |
| `apps/web/src/features/onboarding/components/steps/questionnaire.tsx:31`                             | `Render`                             | moderate | 5          | 2         | 30.0 **!**  | 213   |
| `apps/web/src/features/onboarding/lib/member/form.ts:101`                                            | `buildMemberOnboardingDefaultValues` | moderate | 5          | 5         | 30.0 **!**  | 39    |
| `apps/web/src/features/calendar/components/header/filters.tsx:40`                                    | `<arrow>`                            | moderate | 5          | 5         | 30.0 **!**  | 12    |
| `apps/web/src/features/calendar/utils/date.ts:8`                                                     | `rangeText`                          | moderate | 5          | 1         | 30.0 **!**  | 31    |
| `apps/web/src/features/calendar/utils/date.ts:87`                                                    | `getCalendarRange`                   | moderate | 5          | 6         | 30.0 **!**  | 19    |
| `apps/web/src/features/organization/components/questionnaires/conditions-builder.tsx:33`             | `addCondition`                       | moderate | 5          | 3         | 30.0 **!**  | 16    |
| `apps/web/src/features/organization/components/questionnaires/conditions-builder.tsx:98`             | `<arrow>`                            | moderate | 5          | 2         | 30.0 **!**  | 16    |
| `apps/web/src/features/organization/components/questionnaires/conditions-builder.tsx:79`             | `<arrow>`                            | moderate | 5          | 2         | 30.0 **!**  | 111   |
| `apps/web/src/routes/org/$slug/(authenticated)/admin/boards/index.tsx:71`                            | `<arrow>`                            | moderate | 5          | 3         | 30.0 **!**  | 87    |
| `apps/web/src/shared/components/data-table/toolbar/date-filter.tsx:64`                               | `selectedDates`                      | moderate | 5          | 5         | 30.0 **!**  | 17    |
| `apps/web/src/shared/components/data-table/toolbar/date-filter.tsx:108`                              | `hasValue`                           | moderate | 5          | 5         | 30.0 **!**  | 8     |
| `apps/web/src/shared/components/data-table/toolbar/date-filter.tsx:57`                               | `DataTableDateFilter`                | moderate | 5          | 6         | 30.0 **!**  | 169   |
| `apps/web/src/routes/org/$slug/(authenticated)/admin/services/$id.index.tsx:54`                      | `RouteComponent`                     | moderate | 5          | 4         | 30.0 **!**  | 165   |
| `apps/web/src/features/organization/components/feed/post/comment-item.tsx:117`                       | `ReplyItem`                          | moderate | 5          | 2         | 30.0 **!**  | 16    |
| `apps/web/src/features/calendar/hooks/use-range-swipe.tsx:153`                                       | `handler`                            | moderate | 5          | 4         | 30.0 **!**  | 14    |
| `apps/web/src/routes/org/$slug/(authenticated)/settings/account/profile/index.tsx:29`                | `RouteComponent`                     | moderate | 5          | 4         | 30.0 **!**  | 45    |
| `apps/web/src/shared/components/ui/calendar.tsx:190`                                                 | `CalendarDayButton`                  | moderate | 5          | 1         | 30.0 **!**  | 37    |
| `apps/web/src/features/organization/components/members/profile/rider/overview/level.tsx:46`          | `<arrow>`                            | moderate | 5          | 2         | 30.0 **!**  | 9     |
| `apps/web/src/features/organization/components/members/profile/rider/overview/level.tsx:22`          | `RiderLevel`                         | moderate | 5          | 4         | 30.0 **!**  | 62    |
| `apps/web/src/routes/org/$slug/(authenticated)/settings/organization/general/-logo.tsx:32`           | `onSubmit`                           | moderate | 5          | 5         | 30.0 **!**  | 41    |
| `apps/web/src/shared/components/form/variants/trainer-select-field.tsx:134`                          | `MultiSelectField`                   | moderate | 5          | 4         | 30.0 **!**  | 63    |
| `apps/web/src/features/calendar/utils/lesson.ts:6`                                                   | `groupLessons`                       | moderate | 5          | 8         | 30.0 **!**  | 26    |
| `apps/web/src/shared/components/ui/sortable.tsx:132`                                                 | `handleDragEnd`                      | moderate | 5          | 5         | 30.0 **!**  | 24    |
| `apps/web/src/shared/components/ui/sortable.tsx:250`                                                 | `SortableItem`                       | moderate | 5          | 4         | 30.0 **!**  | 79    |
| `apps/web/src/features/calendar/components/header/index.tsx:27`                                      | `CalendarHeader`                     | moderate | 5          | 5         | 30.0 **!**  | 92    |
| `apps/web/src/features/organization/components/members/list/index.tsx:21`                            | `MemberList`                         | moderate | 5          | 3         | 30.0 **!**  | 96    |
| `apps/web/src/features/onboarding/lib/member/questionnaire.schema.ts:71`                             | `buildInitialResponses`              | moderate | 5          | 7         | 30.0 **!**  | 24    |
| `apps/web/src/features/onboarding/components/wizard.tsx:25`                                          | `OnboardingWizard`                   | moderate | 5          | 3         | 30.0 **!**  | 90    |
| `apps/web/src/features/lessons/components/form/create/booking-calendar.tsx:154`                      | `<arrow>`                            | moderate | 5          | 4         | 30.0 **!**  | 25    |
| `apps/web/src/features/calendar/utils/multi-day.ts:53`                                               | `dayColumnRange`                     | moderate | 5          | 3         | 30.0 **!**  | 17    |
| `apps/web/src/shared/components/auth/reset-password-form.tsx:44`                                     | `onSubmit`                           | moderate | 5          | 5         | 30.0 **!**  | 20    |
| `apps/web/src/shared/components/form/checkbox-field.tsx:20`                                          | `CheckboxField`                      | moderate | 5          | 4         | 30.0 **!**  | 39    |
| `apps/web/src/routes/org/$slug.tsx:33`                                                               | `beforeLoad`                         | moderate | 5          | 5         | 30.0 **!**  | 61    |
| `apps/web/src/features/calendar/hooks/use-calendar.tsx:180`                                          | `<arrow>`                            | moderate | 5          | 4         | 30.0 **!**  | 12    |
| `apps/web/src/features/calendar/hooks/use-calendar.tsx:195`                                          | `<arrow>`                            | moderate | 5          | 4         | 30.0 **!**  | 12    |
| `apps/web/src/features/lessons/components/form/create/index.tsx:56`                                  | `createDefaultValues`                | moderate | 5          | 4         | 30.0 **!**  | 23    |
| `apps/web/src/shared/components/data-table/index.tsx:22`                                             | `DataTable`                          | moderate | 5          | 2         | 30.0 **!**  | 81    |
| `apps/web/src/shared/components/ui/sidebar.tsx:497`                                                  | `SidebarMenuButton`                  | moderate | 5          | 4         | 30.0 **!**  | 53    |
| `apps/web/src/shared/components/ui/faceted-filter.tsx:19`                                            | `FacetedFilter`                      | moderate | 5          | 3         | 30.0 **!**  | 114   |
| `apps/web/src/features/organization/components/questionnaires/question-builder.tsx:41`               | `moveQuestion`                       | moderate | 5          | 4         | 30.0 **!**  | 15    |
| `apps/web/src/features/organization/components/questionnaires/question-builder.tsx:128`              | `<arrow>`                            | moderate | 5          | 4         | 30.0 **!**  | 20    |
| `apps/web/src/shared/components/fragments/input-search.tsx:19`                                       | `InputSearch`                        | moderate | 5          | 4         | 30.0 **!**  | 102   |
| `apps/web/src/routes/org/$slug/(authenticated)/admin/calendar/index.tsx:77`                          | `RouteComponent`                     | moderate | 5          | 6         | 30.0 **!**  | 59    |
| `apps/web/src/routes/org/$slug/(authenticated)/portal/calendar/index.tsx:90`                         | `RouteComponent`                     | moderate | 5          | 6         | 30.0 **!**  | 63    |
| `apps/web/src/shared/components/layout/page.tsx:18`                                                  | `PageHeader`                         | moderate | 5          | 4         | 30.0 **!**  | 49    |
| `apps/web/src/shared/components/ui/input-otp.tsx:41`                                                 | `InputOTPSlot`                       | moderate | 5          | 4         | 30.0 **!**  | 31    |
| `apps/web/src/shared/lib/config/colors.ts:43`                                                        | `getRoleColor`                       | moderate | 5          | 1         | 30.0 **!**  | 14    |
| `apps/web/src/routes/org/$slug/(authenticated)/settings/organization/kiosk.tsx:204`                  | `KioskSessionForm`                   | moderate | 5          | 2         | 30.0 **!**  | 105   |
| `apps/web/src/routes/org/$slug/(authenticated)/admin/members/-columns.tsx:132`                       | `cell`                               | moderate | 5          | 7         | 30.0 **!**  | 103   |
| `apps/web/src/routes/org/$slug/(authenticated)/index.tsx:11`                                         | `beforeLoad`                         | moderate | 5          | 4         | 30.0 **!**  | 16    |

**366** files, **2716** functions analyzed (thresholds: cyclomatic > 20, cognitive > 15, CRAP >= 30.0)

### File Health Scores (350 files)

| File                                                                                              | Maintainability | Fan-in | Fan-out | Dead Code | Density | Risk  |
| :------------------------------------------------------------------------------------------------ | :-------------- | :----- | :------ | :-------- | :------ | :---- |
| `apps/web/src/features/lessons/components/form/create/index.tsx`                                  | 66.8            | 0      | 5       | 100%      | 0.20    | 72.0  |
| `apps/web/src/shared/components/ui/time-picker.tsx`                                               | 68.2            | 0      | 4       | 100%      | 0.18    | 210.0 |
| `apps/web/src/features/organization/components/members/profile/rider/overview/index.tsx`          | 68.4            | 0      | 7       | 100%      | 0.11    | 182.0 |
| `apps/web/src/features/lessons/components/form/create/booking-calendar.tsx`                       | 68.6            | 1      | 5       | 100%      | 0.14    | 132.0 |
| `apps/web/src/features/kiosk/components/lessons/actions.tsx`                                      | 69.4            | 0      | 3       | 100%      | 0.17    | 182.0 |
| `apps/web/src/shared/components/auth/otp-card.tsx`                                                | 69.5            | 0      | 6       | 100%      | 0.09    | 12.0  |
| `apps/web/src/features/kiosk/components/acting-banner.tsx`                                        | 69.8            | 0      | 6       | 100%      | 0.08    | 20.0  |
| `apps/web/src/features/organization/components/members/profile/rider/tabs/lessons.tsx`            | 70.2            | 0      | 2       | 100%      | 0.18    | 56.0  |
| `apps/web/src/features/organization/components/members/profile/rider/overview/boards.tsx`         | 71.1            | 1      | 2       | 100%      | 0.15    | 20.0  |
| `apps/web/src/features/organization/components/members/profile/rider/overview/level.tsx`          | 71.1            | 1      | 2       | 100%      | 0.15    | 30.0  |
| `apps/web/src/shared/components/data-table/toolbar/index.tsx`                                     | 73.1            | 4      | 6       | 67%       | 0.19    | 420.0 |
| `apps/web/src/shared/components/ui/number-field.tsx`                                              | 73.2            | 0      | 2       | 100%      | 0.08    | 20.0  |
| `apps/web/src/features/lessons/components/form/create/time-slot.tsx`                              | 73.8            | 1      | 2       | 100%      | 0.08    | 12.0  |
| `apps/web/src/features/calendar/components/views/fragments/single-calendar.tsx`                   | 74.9            | 0      | 2       | 100%      | 0.05    | 2.0   |
| `apps/web/src/features/calendar/components/mobile/filter-sheet.tsx`                               | 75.0            | 0      | 2       | 100%      | 0.06    | 2.0   |
| `apps/web/src/shared/lib/auth/errors.ts`                                                          | 76.0            | 0      | 1       | 100%      | 0.04    | 6.0   |
| `apps/web/src/shared/lib/search/table.ts`                                                         | 76.2            | 2      | 0       | 86%       | 0.22    | 56.0  |
| `apps/web/src/features/organization/components/members/profile/rider/tabs/activity.tsx`           | 76.6            | 0      | 1       | 100%      | 0.03    | 2.0   |
| `apps/web/src/shared/lib/utils/route-api.ts`                                                      | 76.9            | 0      | 0       | 100%      | 0.15    | 6.0   |
| `apps/web/src/routes/org/$slug/(authenticated)/settings/organization/kiosk.tsx`                   | 77.2            | 1      | 9       | 50%       | 0.12    | 30.0  |
| `apps/web/src/features/lessons/components/modals/new-lesson/index.tsx`                            | 77.4            | 4      | 12      | 33%       | 0.19    | 380.0 |
| `apps/web/src/features/calendar/components/modals/event-modal.tsx`                                | 77.5            | 3      | 6       | 33%       | 0.27    | 870.0 |
| `apps/web/src/features/calendar/utils/initial-state.ts`                                           | 78.2            | 0      | 0       | 100%      | 0.27    | 2.0   |
| `apps/web/src/features/chat/hooks/use-chat-stream.ts`                                             | 78.2            | 0      | 0       | 100%      | 0.27    | 2.0   |
| `apps/web/src/features/calendar/utils/date.ts`                                                    | 78.4            | 2      | 2       | 50%       | 0.24    | 90.0  |
| `apps/web/src/shared/components/ui/progress.tsx`                                                  | 79.4            | 2      | 1       | 80%       | 0.06    | 2.0   |
| `apps/web/src/shared/components/ui/sonner.tsx`                                                    | 79.5            | 0      | 0       | 100%      | 0.02    | 2.0   |
| `apps/web/src/shared/components/ui/button-group.tsx`                                              | 79.7            | 4      | 2       | 75%       | 0.03    | 2.0   |
| `apps/web/src/features/calendar/components/modals/time-block-form.tsx`                            | 79.9            | 2      | 6       | 33%       | 0.19    | 272.0 |
| `apps/web/src/features/lessons/components/modals/view-lesson/index.tsx`                           | 80.1            | 5      | 8       | 33%       | 0.15    | 132.0 |
| `apps/web/src/shared/lib/navigation/links.ts`                                                     | 81.0            | 2      | 0       | 71%       | 0.16    | 6.0   |
| `apps/web/src/features/chat/components/conversation/lesson-proposal-modal.tsx`                    | 81.6            | 1      | 4       | 33%       | 0.18    | 42.0  |
| `apps/web/src/features/organization/components/members/modals/edit-rider.tsx`                     | 81.9            | 2      | 4       | 33%       | 0.17    | 20.0  |
| `apps/web/src/features/organization/components/levels/modal.tsx`                                  | 82.2            | 2      | 4       | 33%       | 0.16    | 110.0 |
| `apps/web/src/features/organization/components/guardians/controls-modal.tsx`                      | 82.5            | 1      | 4       | 33%       | 0.15    | 156.0 |
| `apps/web/src/features/organization/components/waivers/waiver-modal.tsx`                          | 82.5            | 2      | 4       | 33%       | 0.15    | 90.0  |
| `apps/web/src/features/onboarding/lib/member/questionnaire.schema.ts`                             | 82.6            | 3      | 0       | 60%       | 0.18    | 56.0  |
| `apps/web/src/features/organization/components/guardians/dependent-profile-modal.tsx`             | 82.6            | 1      | 5       | 33%       | 0.12    | 20.0  |
| `apps/web/src/shared/components/ui/calendar.tsx`                                                  | 83.2            | 4      | 2       | 50%       | 0.08    | 30.0  |
| `apps/web/src/shared/hooks/use-file-upload.ts`                                                    | 83.7            | 1      | 0       | 50%       | 0.21    | 380.0 |
| `apps/web/src/routeTree.gen.ts`                                                                   | 83.8            | 1      | 74      | 0%        | 0.04    | 2.0   |
| `apps/web/src/shared/components/ui/sidebar.tsx`                                                   | 83.8            | 7      | 8       | 25%       | 0.08    | 72.0  |
| `apps/web/src/features/lessons/components/modals/new-lesson/scheduling.tsx`                       | 84.4            | 1      | 5       | 0%        | 0.28    | 182.0 |
| `apps/web/src/shared/lib/auth/roles.ts`                                                           | 84.6            | 5      | 0       | 50%       | 0.18    | 6.0   |
| `apps/web/src/routes/(authenticated)/admin/route.tsx`                                             | 84.7            | 1      | 6       | 0%        | 0.25    | 156.0 |
| `apps/web/src/features/lessons/components/form/choices.tsx`                                       | 84.8            | 1      | 9       | 0%        | 0.20    | 20.0  |
| `apps/web/src/shared/lib/utils/format.ts`                                                         | 84.8            | 14     | 1       | 38%       | 0.16    | 42.0  |
| `apps/web/src/shared/lib/navigation/settings.ts`                                                  | 85.1            | 3      | 0       | 67%       | 0.05    | 6.0   |
| `apps/web/src/features/lessons/components/form/riders.tsx`                                        | 85.2            | 1      | 12      | 0%        | 0.15    | 72.0  |
| `apps/web/src/features/calendar/components/header/filters.tsx`                                    | 85.4            | 3      | 7       | 0%        | 0.21    | 72.0  |
| `apps/web/src/features/onboarding/lib/organization/validators.ts`                                 | 85.4            | 3      | 0       | 67%       | 0.04    | 6.0   |
| `apps/web/src/shared/components/form/datetime-field.tsx`                                          | 85.4            | 1      | 7       | 0%        | 0.21    | 110.0 |
| `apps/web/src/shared/components/ui/dropdown-menu.tsx`                                             | 85.4            | 24     | 1       | 50%       | 0.06    | 2.0   |
| `apps/web/src/features/calendar/utils/lesson.ts`                                                  | 85.5            | 3      | 1       | 33%       | 0.17    | 30.0  |
| `apps/web/src/routes/(authenticated)/admin/-columns.tsx`                                          | 85.6            | 1      | 11      | 0%        | 0.15    | 42.0  |
| `apps/web/src/shared/components/data-table/toolbar/date-filter.tsx`                               | 85.6            | 1      | 5       | 0%        | 0.24    | 90.0  |
| `apps/web/src/shared/components/layout/header-search.tsx`                                         | 85.7            | 1      | 9       | 0%        | 0.17    | 20.0  |
| `apps/web/src/features/calendar/components/header/index.tsx`                                      | 85.9            | 1      | 10      | 0%        | 0.15    | 110.0 |
| `apps/web/src/features/organization/components/questionnaires/question-builder.tsx`               | 85.9            | 2      | 6       | 0%        | 0.21    | 156.0 |
| `apps/web/src/routes/org/$slug/(authenticated)/settings/organization/members/-invitations.tsx`    | 85.9            | 1      | 14      | 0%        | 0.11    | 156.0 |
| `apps/web/src/routes/org/$slug/(non-member)/onboarding.tsx`                                       | 85.9            | 1      | 10      | 0%        | 0.15    | 132.0 |
| `apps/web/src/shared/components/fragments/user-avatar.tsx`                                        | 85.9            | 30     | 5       | 0%        | 0.23    | 132.0 |
| `apps/web/src/routes/org/$slug/(authenticated)/admin/members/riders/-columns.tsx`                 | 86.0            | 1      | 9       | 0%        | 0.16    | 20.0  |
| `apps/web/src/routes/org/$slug/(authenticated)/portal/lessons/-booking-calendar.tsx`              | 86.0            | 1      | 7       | 0%        | 0.19    | 132.0 |
| `apps/web/src/routes/org/$slug/(authenticated)/portal/lessons/create.tsx`                         | 86.0            | 1      | 7       | 0%        | 0.19    | 156.0 |
| `apps/web/src/shared/components/ui/kbd.tsx`                                                       | 86.1            | 2      | 1       | 50%       | 0.07    | 2.0   |
| `apps/web/src/features/organization/components/feed/filters.tsx`                                  | 86.2            | 2      | 6       | 0%        | 0.20    | 72.0  |
| `apps/web/src/features/organization/components/feed/post/index.tsx`                               | 86.2            | 2      | 5       | 0%        | 0.22    | 240.0 |
| `apps/web/src/shared/components/form/variants/rider-select-field.tsx`                             | 86.2            | 1      | 6       | 0%        | 0.20    | 156.0 |
| `apps/web/src/shared/components/layout/app-layout.tsx`                                            | 86.2            | 3      | 7       | 0%        | 0.23    | 90.0  |
| `apps/web/src/features/lessons/components/modals/new-lesson/details.tsx`                          | 86.3            | 1      | 7       | 0%        | 0.18    | 182.0 |
| `apps/web/src/shared/components/ui/spinner.tsx`                                                   | 86.3            | 4      | 1       | 50%       | 0.03    | 2.0   |
| `apps/web/src/features/calendar/components/views/fragments/multi-day-row/index.tsx`               | 86.5            | 3      | 5       | 0%        | 0.21    | 72.0  |
| `apps/web/src/features/onboarding/components/steps/personal-details.tsx`                          | 86.5            | 3      | 6       | 0%        | 0.19    | 56.0  |
| `apps/web/src/features/organization/components/questionnaires/rule-builder.tsx`                   | 86.5            | 2      | 6       | 0%        | 0.19    | 72.0  |
| `apps/web/src/routes/org/$slug/(authenticated)/settings/account/security/-connected-accounts.tsx` | 86.5            | 1      | 5       | 0%        | 0.21    | 42.0  |
| `apps/web/src/shared/components/form/variants/service-select-field.tsx`                           | 86.5            | 1      | 5       | 0%        | 0.21    | 110.0 |
| `apps/web/src/shared/components/form/variants/trainer-select-field.tsx`                           | 86.5            | 1      | 6       | 0%        | 0.19    | 132.0 |
| `apps/web/src/shared/components/ui/popover.tsx`                                                   | 86.5            | 12     | 1       | 43%       | 0.07    | 2.0   |
| `apps/web/src/features/organization/components/business-hours/tabs.tsx`                           | 86.6            | 2      | 7       | 0%        | 0.17    | 506.0 |
| `apps/web/src/routes/org/$slug/(authenticated)/admin/members/-columns.tsx`                        | 86.6            | 1      | 9       | 0%        | 0.14    | 30.0  |
| `apps/web/src/shared/components/ui/badge.tsx`                                                     | 86.6            | 35     | 1       | 50%       | 0.02    | 2.0   |
| `apps/web/src/features/calendar/components/views/multi-day/index.tsx`                             | 86.7            | 1      | 8       | 0%        | 0.15    | 20.0  |
| `apps/web/src/features/onboarding/components/modals/add-dependent.tsx`                            | 86.7            | 1      | 8       | 0%        | 0.15    | 210.0 |
| `apps/web/src/routes/org/$slug/(authenticated)/admin/index.tsx`                                   | 86.7            | 1      | 13      | 0%        | 0.09    | 132.0 |
| `apps/web/src/features/onboarding/components/steps/questionnaire.tsx`                             | 86.8            | 2      | 5       | 0%        | 0.20    | 56.0  |
| `apps/web/src/shared/components/data-table/toolbar/sort-list.tsx`                                 | 87.0            | 4      | 8       | 0%        | 0.14    | 90.0  |
| `apps/web/src/shared/components/form/choice-card-field.tsx`                                       | 87.0            | 1      | 4       | 0%        | 0.22    | 342.0 |
| `apps/web/src/features/calendar/components/index.tsx`                                             | 87.1            | 3      | 9       | 0%        | 0.19    | 42.0  |
| `apps/web/src/features/calendar/components/views/week/index.tsx`                                  | 87.1            | 1      | 10      | 0%        | 0.11    | 12.0  |
| `apps/web/src/routes/(authenticated)/create-organization.tsx`                                     | 87.1            | 1      | 11      | 0%        | 0.10    | 56.0  |
| `apps/web/src/shared/components/form/clearable-select-field.tsx`                                  | 87.1            | 1      | 5       | 0%        | 0.19    | 210.0 |
| `apps/web/src/features/calendar/components/mobile/day.tsx`                                        | 87.2            | 1      | 9       | 0%        | 0.12    | 6.0   |
| `apps/web/src/routes/org/$slug/(authenticated)/settings/organization/questionnaires/new.tsx`      | 87.2            | 1      | 9       | 0%        | 0.12    | 12.0  |
| `apps/web/src/routes/org/$slug/(authenticated)/admin/feed.tsx`                                    | 87.3            | 1      | 8       | 0%        | 0.13    | 72.0  |
| `apps/web/src/shared/components/form/variants/password-field.tsx`                                 | 87.3            | 1      | 4       | 0%        | 0.21    | 210.0 |
| `apps/web/src/features/lessons/components/modals/new-lesson/riders.tsx`                           | 87.4            | 1      | 5       | 0%        | 0.18    | 72.0  |
| `apps/web/src/features/organization/components/feed/post/comment-item.tsx`                        | 87.4            | 1      | 6       | 0%        | 0.16    | 110.0 |
| `apps/web/src/routes/org/$slug/(authenticated)/admin/members/index.tsx`                           | 87.4            | 1      | 10      | 0%        | 0.10    | 12.0  |
| `apps/web/src/routes/org/$slug/(authenticated)/settings/account/guardian.tsx`                     | 87.4            | 1      | 14      | 0%        | 0.06    | 56.0  |
| `apps/web/src/features/chat/components/sidebar.tsx`                                               | 87.5            | 2      | 7       | 0%        | 0.14    | 72.0  |
| `apps/web/src/features/organization/lib/board.form.ts`                                            | 87.5            | 2      | 0       | 33%       | 0.24    | 42.0  |
| `apps/web/src/features/calendar/components/views/day/index.tsx`                                   | 87.6            | 1      | 8       | 0%        | 0.12    | 12.0  |
| `apps/web/src/features/chat/components/conversation/bubble.tsx`                                   | 87.6            | 1      | 3       | 0%        | 0.23    | 420.0 |
| `apps/web/src/features/lessons/components/fragments/lesson-card/detail.tsx`                       | 87.6            | 1      | 8       | 0%        | 0.12    | 272.0 |
| `apps/web/src/features/calendar/components/views/fragments/lesson-block.tsx`                      | 87.7            | 3      | 6       | 0%        | 0.15    | 552.0 |
| `apps/web/src/features/onboarding/components/steps/waiver.tsx`                                    | 87.7            | 2      | 5       | 0%        | 0.17    | 20.0  |
| `apps/web/src/features/onboarding/components/wizard.tsx`                                          | 87.7            | 2      | 5       | 0%        | 0.17    | 156.0 |
| `apps/web/src/routes/org/$slug/(authenticated)/portal/index.tsx`                                  | 87.7            | 1      | 11      | 0%        | 0.08    | 182.0 |
| `apps/web/src/shared/components/ui/select.tsx`                                                    | 87.7            | 12     | 1       | 40%       | 0.05    | 2.0   |
| `apps/web/src/features/lessons/components/form/information.tsx`                                   | 87.8            | 1      | 7       | 0%        | 0.13    | 56.0  |
| `apps/web/src/routes/org/$slug/(authenticated)/admin/services/$id.edit.tsx`                       | 87.8            | 1      | 7       | 0%        | 0.13    | 6.0   |
| `apps/web/src/routes/org/$slug/(authenticated)/admin/services/index.tsx`                          | 87.8            | 1      | 9       | 0%        | 0.10    | 20.0  |
| `apps/web/src/routes/org/$slug/(authenticated)/admin/services/new.tsx`                            | 87.8            | 1      | 7       | 0%        | 0.13    | 6.0   |
| `apps/web/src/routes/org/$slug/(authenticated)/settings/organization/questionnaires/$id.edit.tsx` | 87.8            | 1      | 9       | 0%        | 0.10    | 12.0  |
| `apps/web/src/features/organization/components/questionnaires/conditions-builder.tsx`             | 87.9            | 1      | 4       | 0%        | 0.19    | 30.0  |
| `apps/web/src/shared/components/form/select-field.tsx`                                            | 87.9            | 1      | 4       | 0%        | 0.19    | 182.0 |
| `apps/web/src/routes/org/$slug/(authenticated)/settings/organization/general/-levels.tsx`         | 88.0            | 1      | 10      | 0%        | 0.08    | 12.0  |
| `apps/web/src/routes/org/$slug/(authenticated)/admin/calendar/new.tsx`                            | 88.1            | 1      | 7       | 0%        | 0.12    | 12.0  |
| `apps/web/src/shared/components/data-table/toolbar/faceted-filter.tsx`                            | 88.1            | 1      | 7       | 0%        | 0.12    | 72.0  |
| `apps/web/src/shared/components/ui/item.tsx`                                                      | 88.1            | 16     | 2       | 30%       | 0.05    | 2.0   |
| `apps/web/src/features/calendar/hooks/use-calendar.tsx`                                           | 88.2            | 23     | 4       | 0%        | 0.18    | 72.0  |
| `apps/web/src/features/calendar/lib/constants.ts`                                                 | 88.2            | 9      | 0       | 56%       | 0.06    | 2.0   |
| `apps/web/src/features/chat/components/conversation/composer.tsx`                                 | 88.2            | 1      | 8       | 0%        | 0.10    | 12.0  |
| `apps/web/src/features/kiosk/components/header.tsx`                                               | 88.2            | 1      | 8       | 0%        | 0.10    | 56.0  |
| `apps/web/src/routes/org/$slug/(authenticated)/portal/feed.tsx`                                   | 88.3            | 1      | 6       | 0%        | 0.13    | 72.0  |
| `apps/web/src/features/lessons/components/fragments/lesson-card/date-chip.tsx`                    | 88.4            | 2      | 7       | 0%        | 0.11    | 56.0  |
| `apps/web/src/routes/org/$slug/(authenticated)/admin/boards/$id.edit.tsx`                         | 88.4            | 1      | 7       | 0%        | 0.11    | 2.0   |
| `apps/web/src/features/calendar/utils/multi-day.ts`                                               | 88.5            | 1      | 1       | 0%        | 0.29    | 56.0  |
| `apps/web/src/features/organization/components/members/list/index.tsx`                            | 88.5            | 1      | 3       | 0%        | 0.20    | 30.0  |
| `apps/web/src/features/chat/components/conversation/list.tsx`                                     | 88.6            | 1      | 5       | 0%        | 0.14    | 72.0  |
| `apps/web/src/features/onboarding/components/steps/organization-details.tsx`                      | 88.6            | 1      | 5       | 0%        | 0.14    | 6.0   |
| `apps/web/src/features/organization/components/feed/post/comment-sheet.tsx`                       | 88.6            | 1      | 5       | 0%        | 0.14    | 42.0  |
| `apps/web/src/shared/components/ui/combobox.tsx`                                                  | 88.6            | 6      | 3       | 19%       | 0.07    | 12.0  |
| `apps/web/src/features/chat/components/conversation/lesson-attachment/card.tsx`                   | 88.7            | 2      | 7       | 0%        | 0.10    | 156.0 |
| `apps/web/src/routes/org/$slug/(authenticated)/admin/members/trainers/index.tsx`                  | 88.7            | 1      | 7       | 0%        | 0.10    | 6.0   |
| `apps/web/src/shared/components/form/text-field.tsx`                                              | 88.8            | 1      | 4       | 0%        | 0.16    | 132.0 |
| `apps/web/src/features/chat/components/new-conversation-modal.tsx`                                | 88.9            | 1      | 6       | 0%        | 0.11    | 12.0  |
| `apps/web/src/routes/org/$slug/(authenticated)/admin/boards/new.tsx`                              | 88.9            | 1      | 6       | 0%        | 0.11    | 2.0   |
| `apps/web/src/shared/components/auth/reset-password-form.tsx`                                     | 88.9            | 2      | 6       | 0%        | 0.11    | 30.0  |
| `apps/web/src/features/lessons/components/modals/view-lesson/riders-list.tsx`                     | 89.1            | 1      | 4       | 0%        | 0.15    | 90.0  |
| `apps/web/src/features/organization/components/members/modals/role-modal.tsx`                     | 89.1            | 3      | 4       | 0%        | 0.15    | 20.0  |
| `apps/web/src/features/organization/utils/questionnaire.ts`                                       | 89.1            | 4      | 0       | 17%       | 0.25    | 56.0  |
| `apps/web/src/routes/org/$slug/(authenticated)/settings/account/profile/index.tsx`                | 89.1            | 2      | 8       | 0%        | 0.07    | 30.0  |
| `apps/web/src/shared/components/ui/avatar.tsx`                                                    | 89.1            | 17     | 1       | 33%       | 0.05    | 2.0   |
| `apps/web/src/shared/components/ui/dialog.tsx`                                                    | 89.1            | 30     | 4       | 9%        | 0.09    | 20.0  |
| `apps/web/src/features/calendar/components/views/day/column.tsx`                                  | 89.2            | 2      | 5       | 0%        | 0.12    | 12.0  |
| `apps/web/src/features/calendar/components/views/fragments/hour-cell.tsx`                         | 89.2            | 3      | 5       | 0%        | 0.12    | 110.0 |
| `apps/web/src/routes/org/$slug/(authenticated)/admin/members/trainers/-columns.tsx`               | 89.2            | 1      | 5       | 0%        | 0.12    | 12.0  |
| `apps/web/src/shared/components/auth/forgot-password.tsx`                                         | 89.2            | 2      | 6       | 0%        | 0.10    | 20.0  |
| `apps/web/src/shared/components/layout/app-header.tsx`                                            | 89.2            | 1      | 11      | 0%        | 0.03    | 12.0  |
| `apps/web/src/shared/components/ui/alert-dialog.tsx`                                              | 89.2            | 2      | 2       | 23%       | 0.06    | 2.0   |
| `apps/web/src/shared/components/ui/faceted-filter.tsx`                                            | 89.2            | 1      | 6       | 0%        | 0.10    | 30.0  |
| `apps/web/src/features/organization/components/feed/composer.tsx`                                 | 89.3            | 2      | 2       | 0%        | 0.21    | 72.0  |
| `apps/web/src/routes/org/$slug/(authenticated)/admin/members/riders/index.tsx`                    | 89.3            | 1      | 7       | 0%        | 0.08    | 6.0   |
| `apps/web/src/features/organization/components/business-hours/day-row.tsx`                        | 89.4            | 1      | 4       | 0%        | 0.14    | 12.0  |
| `apps/web/src/shared/components/theme-provider.tsx`                                               | 89.4            | 1      | 0       | 50%       | 0.08    | 2.0   |
| `apps/web/src/features/calendar/components/views/agenda/index.tsx`                                | 89.5            | 1      | 5       | 0%        | 0.11    | 20.0  |
| `apps/web/src/features/organization/components/feed/post/header.tsx`                              | 89.5            | 1      | 5       | 0%        | 0.11    | 110.0 |
| `apps/web/src/routes/org/$slug/(authenticated)/admin/boards/index.tsx`                            | 89.5            | 1      | 6       | 0%        | 0.09    | 30.0  |
| `apps/web/src/routes/org/$slug/(authenticated)/settings/account/security/index.tsx`               | 89.5            | 1      | 5       | 0%        | 0.11    | 12.0  |
| `apps/web/src/shared/components/auth/register-form.tsx`                                           | 89.5            | 2      | 6       | 0%        | 0.09    | 12.0  |
| `apps/web/src/shared/components/layout/mobile-nav.tsx`                                            | 89.5            | 1      | 5       | 0%        | 0.11    | 20.0  |
| `apps/web/src/shared/components/layout/settings-page.tsx`                                         | 89.5            | 1      | 6       | 0%        | 0.09    | 42.0  |
| `apps/web/src/shared/components/ui/phone-input.tsx`                                               | 89.5            | 1      | 5       | 0%        | 0.11    | 42.0  |
| `apps/web/src/features/organization/components/levels/level-badge.tsx`                            | 89.6            | 5      | 3       | 0%        | 0.35    | 72.0  |
| `apps/web/src/features/chat/components/conversation-item.tsx`                                     | 89.7            | 1      | 4       | 0%        | 0.13    | 72.0  |
| `apps/web/src/features/onboarding/components/steps/organization-setup.tsx`                        | 89.7            | 1      | 4       | 0%        | 0.13    | 20.0  |
| `apps/web/src/routes/org/$slug/(authenticated)/kiosk/$sessionId/calendar.tsx`                     | 89.7            | 1      | 4       | 0%        | 0.13    | 30.0  |
| `apps/web/src/routes/org/$slug/(authenticated)/portal/calendar/index.tsx`                         | 89.7            | 1      | 4       | 0%        | 0.13    | 30.0  |
| `apps/web/src/routes/org/$slug/(authenticated)/settings/account/profile/-details.tsx`             | 89.7            | 1      | 4       | 0%        | 0.13    | 42.0  |
| `apps/web/src/routes/org/$slug/(authenticated)/settings/organization/general/-logo.tsx`           | 89.7            | 1      | 4       | 0%        | 0.13    | 30.0  |
| `apps/web/src/features/kiosk/components/act-as-modal.tsx`                                         | 89.8            | 4      | 5       | 0%        | 0.10    | 42.0  |
| `apps/web/src/features/lessons/lib/utils.ts`                                                      | 89.8            | 2      | 0       | 0%        | 0.34    | 42.0  |
| `apps/web/src/routes/(authenticated)/admin/-action-bar.tsx`                                       | 89.8            | 1      | 3       | 0%        | 0.17    | 20.0  |
| `apps/web/src/routes/__root.tsx`                                                                  | 89.8            | 1      | 5       | 0%        | 0.10    | 132.0 |
| `apps/web/src/routes/org/$slug/(authenticated)/admin/services/$id.index.tsx`                      | 89.8            | 1      | 6       | 0%        | 0.08    | 42.0  |
| `apps/web/src/routes/org/$slug/(authenticated)/settings/organization/general/-details.tsx`        | 89.8            | 1      | 5       | 0%        | 0.10    | 2.0   |
| `apps/web/src/routes/org/$slug/(non-member)/invitation/$token.tsx`                                | 89.8            | 1      | 5       | 0%        | 0.10    | 12.0  |
| `apps/web/src/shared/components/auth/login-form.tsx`                                              | 89.8            | 2      | 6       | 0%        | 0.08    | 12.0  |
| `apps/web/src/shared/components/form/date-field.tsx`                                              | 89.8            | 1      | 6       | 0%        | 0.08    | 20.0  |
| `apps/web/src/routes/(authenticated)/index.tsx`                                                   | 89.9            | 1      | 7       | 0%        | 0.06    | 20.0  |
| `apps/web/src/routes/org/$slug/(authenticated)/settings/organization/business-hours.tsx`          | 89.9            | 1      | 7       | 0%        | 0.06    | 2.0   |
| `apps/web/src/routes/org/$slug/(authenticated)/settings/organization/general/index.tsx`           | 89.9            | 4      | 9       | 0%        | 0.03    | 2.0   |
| `apps/web/src/shared/components/modals.tsx`                                                       | 89.9            | 1      | 10      | 0%        | 0.03    | 2.0   |
| `apps/web/src/main.tsx`                                                                           | 90.0            | 2      | 4       | 0%        | 0.12    | 56.0  |
| `apps/web/src/routes/org/$slug/(authenticated)/settings/organization/waivers/index.tsx`           | 90.0            | 1      | 8       | 0%        | 0.04    | 12.0  |
| `apps/web/src/features/calendar/hooks/use-slot-height.tsx`                                        | 90.1            | 1      | 2       | 0%        | 0.19    | 12.0  |
| `apps/web/src/routes/org/$slug/(authenticated)/admin/boards/$id.index.tsx`                        | 90.1            | 1      | 6       | 0%        | 0.07    | 42.0  |
| `apps/web/src/shared/components/ui/table.tsx`                                                     | 90.1            | 3      | 1       | 25%       | 0.07    | 2.0   |
| `apps/web/src/routes/org/$slug/(authenticated)/admin/members/riders/$riderId.tsx`                 | 90.2            | 1      | 7       | 0%        | 0.05    | 56.0  |
| `apps/web/src/routes/org/$slug/(authenticated)/settings/account/availability.tsx`                 | 90.2            | 1      | 7       | 0%        | 0.05    | 6.0   |
| `apps/web/src/features/organization/components/business-hours/form.tsx`                           | 90.3            | 2      | 3       | 0%        | 0.14    | 12.0  |
| `apps/web/src/features/organization/components/members/list/card.tsx`                             | 90.3            | 1      | 4       | 0%        | 0.11    | 90.0  |
| `apps/web/src/routes/org/$slug/(authenticated)/admin/calendar/index.tsx`                          | 90.3            | 1      | 4       | 0%        | 0.11    | 30.0  |
| `apps/web/src/routes/org/$slug/(authenticated)/settings/account/security/-change-password.tsx`    | 90.3            | 1      | 4       | 0%        | 0.11    | 20.0  |
| `apps/web/src/shared/components/data-table/index.tsx`                                             | 90.3            | 4      | 4       | 0%        | 0.11    | 30.0  |
| `apps/web/src/shared/components/form/textarea-field.tsx`                                          | 90.3            | 1      | 3       | 0%        | 0.16    | 42.0  |
| `apps/web/src/features/calendar/hooks/use-range-swipe.tsx`                                        | 90.5            | 4      | 2       | 0%        | 0.17    | 56.0  |
| `apps/web/src/routes/org/$slug/(authenticated)/admin/members/$id.index.tsx`                       | 90.6            | 1      | 4       | 0%        | 0.10    | 56.0  |
| `apps/web/src/routes/org/$slug/(authenticated)/portal/route.tsx`                                  | 90.6            | 1      | 3       | 0%        | 0.13    | 272.0 |
| `apps/web/src/routes/org/$slug/(authenticated)/settings/organization/members/-invite.tsx`         | 90.6            | 1      | 3       | 0%        | 0.13    | 6.0   |
| `apps/web/src/shared/components/data-table/toolbar/view-options.tsx`                              | 90.6            | 1      | 4       | 0%        | 0.10    | 20.0  |
| `apps/web/src/shared/components/form/checkbox-field.tsx`                                          | 90.6            | 1      | 4       | 0%        | 0.10    | 30.0  |
| `apps/web/src/features/calendar/components/mobile/header.tsx`                                     | 90.7            | 1      | 5       | 0%        | 0.07    | 20.0  |
| `apps/web/src/features/chat/components/conversation/header.tsx`                                   | 90.7            | 1      | 6       | 0%        | 0.05    | 20.0  |
| `apps/web/src/routes/org/$slug/(authenticated)/settings/organization/general/-socials.tsx`        | 90.7            | 1      | 5       | 0%        | 0.07    | 2.0   |
| `apps/web/src/shared/components/form/submit-button.tsx`                                           | 90.8            | 1      | 3       | 0%        | 0.17    | 20.0  |
| `apps/web/src/shared/components/ui/command.tsx`                                                   | 90.8            | 6      | 3       | 11%       | 0.05    | 6.0   |
| `apps/web/src/features/calendar/components/header/view-switcher.tsx`                              | 90.9            | 1      | 4       | 0%        | 0.09    | 12.0  |
| `apps/web/src/routes/org/$slug/(authenticated)/route.tsx`                                         | 90.9            | 1      | 1       | 0%        | 0.21    | 210.0 |
| `apps/web/src/features/calendar/components/header/date-navigator.tsx`                             | 91.0            | 1      | 5       | 0%        | 0.06    | 6.0   |
| `apps/web/src/features/calendar/components/mobile/calendar.tsx`                                   | 91.0            | 1      | 5       | 0%        | 0.10    | 6.0   |
| `apps/web/src/features/lessons/components/fragments/lesson-card/agenda.tsx`                       | 91.0            | 1      | 6       | 0%        | 0.04    | 6.0   |
| `apps/web/src/shared/components/layout/detail-layout.tsx`                                         | 91.0            | 6      | 5       | 0%        | 0.06    | 20.0  |
| `apps/web/src/features/lessons/components/fragments/lesson-card/index.tsx`                        | 91.1            | 7      | 4       | 0%        | 0.10    | 20.0  |
| `apps/web/src/shared/components/form/color-picker-field.tsx`                                      | 91.1            | 1      | 4       | 0%        | 0.15    | 12.0  |
| `apps/web/src/features/kiosk/hooks/use-kiosk.tsx`                                                 | 91.2            | 5      | 3       | 0%        | 0.11    | 12.0  |
| `apps/web/src/features/lessons/components/modals/view-lesson/lesson-details.tsx`                  | 91.2            | 1      | 3       | 0%        | 0.11    | 56.0  |
| `apps/web/src/features/onboarding/components/steps/account-type.tsx`                              | 91.2            | 1      | 3       | 0%        | 0.11    | 6.0   |
| `apps/web/src/features/onboarding/components/steps/guardian-controls.tsx`                         | 91.2            | 2      | 3       | 0%        | 0.11    | 2.0   |
| `apps/web/src/features/organization/components/activity/enrollment.tsx`                           | 91.2            | 1      | 4       | 0%        | 0.08    | 56.0  |
| `apps/web/src/routes/org/$slug/(authenticated)/kiosk/$sessionId/route.tsx`                        | 91.2            | 1      | 4       | 0%        | 0.08    | 6.0   |
| `apps/web/src/shared/components/form/multiselect-field.tsx`                                       | 91.2            | 1      | 3       | 0%        | 0.11    | 12.0  |
| `apps/web/src/shared/components/fragments/input-search.tsx`                                       | 91.2            | 1      | 1       | 0%        | 0.20    | 30.0  |
| `apps/web/src/features/calendar/components/mobile/week-strip.tsx`                                 | 91.3            | 1      | 2       | 0%        | 0.18    | 20.0  |
| `apps/web/src/routes/org/$slug/(authenticated)/settings/index.tsx`                                | 91.3            | 1      | 5       | 0%        | 0.05    | 6.0   |
| `apps/web/src/shared/components/layout/app-sidebar.tsx`                                           | 91.3            | 1      | 5       | 0%        | 0.05    | 12.0  |
| `apps/web/src/shared/components/form/switch-field.tsx`                                            | 91.4            | 1      | 3       | 0%        | 0.12    | 30.0  |
| `apps/web/src/features/chat/components/conversation/lesson-picker.tsx`                            | 91.5            | 1      | 3       | 0%        | 0.10    | 20.0  |
| `apps/web/src/features/lessons/components/modals/view-lesson/portal-actions.tsx`                  | 91.5            | 1      | 1       | 0%        | 0.19    | 306.0 |
| `apps/web/src/routes/auth/callback.tsx`                                                           | 91.5            | 1      | 1       | 0%        | 0.19    | 272.0 |
| `apps/web/src/routes/org/$slug/(authenticated)/kiosk/index.tsx`                                   | 91.5            | 1      | 4       | 0%        | 0.07    | 12.0  |
| `apps/web/src/routes/org/$slug/(authenticated)/settings/account/profile/-pin.tsx`                 | 91.5            | 1      | 4       | 0%        | 0.07    | 6.0   |
| `apps/web/src/routes/org/$slug/(non-member)/route.tsx`                                            | 91.5            | 1      | 1       | 0%        | 0.19    | 342.0 |
| `apps/web/src/shared/components/data-table/action-bar.tsx`                                        | 91.5            | 4      | 4       | 0%        | 0.07    | 6.0   |
| `apps/web/src/shared/components/form/phone-field.tsx`                                             | 91.5            | 1      | 3       | 0%        | 0.15    | 20.0  |
| `apps/web/src/shared/components/ui/color-picker.tsx`                                              | 91.5            | 1      | 4       | 0%        | 0.07    | 20.0  |
| `apps/web/src/shared/components/ui/field.tsx`                                                     | 91.5            | 60     | 3       | 0%        | 0.10    | 56.0  |
| `apps/web/src/features/onboarding/lib/dependent/form.ts`                                          | 91.6            | 3      | 1       | 25%       | 0.02    | 6.0   |
| `apps/web/src/routes/org/$slug/(authenticated)/admin/members/riders/$riderId.index.tsx`           | 91.6            | 1      | 5       | 0%        | 0.04    | 6.0   |
| `apps/web/src/shared/components/confirmation-modal.tsx`                                           | 91.7            | 12     | 2       | 0%        | 0.13    | 56.0  |
| `apps/web/src/shared/components/data-table/column-header.tsx`                                     | 91.7            | 4      | 2       | 0%        | 0.13    | 90.0  |
| `apps/web/src/shared/components/ui/tooltip.tsx`                                                   | 91.7            | 10     | 1       | 20%       | 0.05    | 2.0   |
| `apps/web/src/features/organization/components/members/invitation-card.tsx`                       | 91.8            | 1      | 3       | 0%        | 0.09    | 56.0  |
| `apps/web/src/shared/components/form/radio-field.tsx`                                             | 91.8            | 1      | 3       | 0%        | 0.09    | 42.0  |
| `apps/web/src/shared/components/layout/page.tsx`                                                  | 91.8            | 15     | 3       | 0%        | 0.09    | 30.0  |
| `apps/web/src/shared/components/ui/file-upload.tsx`                                               | 91.8            | 5      | 4       | 0%        | 0.06    | 90.0  |
| `apps/web/src/shared/hooks/use-data-table.ts`                                                     | 91.8            | 4      | 1       | 0%        | 0.18    | 90.0  |
| `apps/web/src/features/calendar/components/views/fragments/timeline.tsx`                          | 91.9            | 4      | 2       | 0%        | 0.18    | 12.0  |
| `apps/web/src/routes/(authenticated)/join-organization.tsx`                                       | 92.1            | 1      | 4       | 0%        | 0.05    | 6.0   |
| `apps/web/src/shared/components/auth/impersonation-banner.tsx`                                    | 92.1            | 2      | 3       | 0%        | 0.10    | 12.0  |
| `apps/web/src/shared/components/fragments/role-list.tsx`                                          | 92.1            | 1      | 3       | 0%        | 0.09    | 6.0   |
| `apps/web/src/shared/components/layout/admin-nav.tsx`                                             | 92.1            | 1      | 3       | 0%        | 0.08    | 6.0   |
| `apps/web/src/shared/components/layout/nav-user.tsx`                                              | 92.1            | 1      | 4       | 0%        | 0.05    | 12.0  |
| `apps/web/src/shared/components/layout/user-dropdown.tsx`                                         | 92.1            | 2      | 3       | 0%        | 0.08    | 90.0  |
| `apps/web/src/shared/components/ui/input-group.tsx`                                               | 92.1            | 19     | 4       | 0%        | 0.05    | 6.0   |
| `apps/web/src/features/chat/utils/grouping.ts`                                                    | 92.2            | 2      | 0       | 0%        | 0.26    | 182.0 |
| `apps/web/src/features/onboarding/lib/member/form.ts`                                             | 92.3            | 5      | 1       | 17%       | 0.05    | 30.0  |
| `apps/web/src/features/organization/components/members/profile/overview.tsx`                      | 92.3            | 1      | 2       | 0%        | 0.11    | 42.0  |
| `apps/web/src/shared/components/auth/invitation-cards.tsx`                                        | 92.4            | 2      | 3       | 0%        | 0.07    | 20.0  |
| `apps/web/src/features/chat/components/conversation/index.tsx`                                    | 92.5            | 2      | 3       | 0%        | 0.08    | 2.0   |
| `apps/web/src/features/kiosk/hooks/use-kiosk-expiry.ts`                                           | 92.5            | 2      | 0       | 0%        | 0.25    | 12.0  |
| `apps/web/src/routes/org/$slug/(authenticated)/settings/organization/members/index.tsx`           | 92.5            | 3      | 4       | 0%        | 0.04    | 2.0   |
| `apps/web/src/features/chat/components/conversation/lesson-attachment/proposal.tsx`               | 92.6            | 1      | 2       | 0%        | 0.10    | 20.0  |
| `apps/web/src/routes/org/$slug/(authenticated)/settings/organization/questionnaires/index.tsx`    | 92.7            | 1      | 4       | 0%        | 0.03    | 6.0   |
| `apps/web/src/shared/components/data-table/pagination.tsx`                                        | 92.7            | 1      | 3       | 0%        | 0.06    | 2.0   |
| `apps/web/src/shared/components/ui/tabs.tsx`                                                      | 92.9            | 3      | 1       | 14%       | 0.05    | 2.0   |
| `apps/web/src/shared/lib/utils/data-table.ts`                                                     | 92.9            | 1      | 0       | 0%        | 0.35    | 156.0 |
| `apps/web/src/shared/components/ui/radio-group.tsx`                                               | 93.0            | 4      | 1       | 0%        | 0.14    | 20.0  |
| `apps/web/src/features/onboarding/components/modals/guardian-invitation.tsx`                      | 93.2            | 2      | 2       | 0%        | 0.08    | 6.0   |
| `apps/web/src/shared/components/ui/sheet.tsx`                                                     | 93.2            | 8      | 2       | 0%        | 0.08    | 12.0  |
| `apps/web/src/features/calendar/components/views/fragments/multi-day-row/item.tsx`                | 93.3            | 1      | 1       | 0%        | 0.13    | 72.0  |
| `apps/web/src/routes/org/$slug/(authenticated)/settings/route.tsx`                                | 93.3            | 1      | 3       | 0%        | 0.06    | 2.0   |
| `apps/web/src/shared/hooks/use-hot-key.ts`                                                        | 93.3            | 1      | 0       | 0%        | 0.37    | 56.0  |
| `apps/web/src/routes/org/$slug/(authenticated)/index.tsx`                                         | 93.5            | 1      | 2       | 0%        | 0.07    | 30.0  |
| `apps/web/src/routes/org/$slug/(authenticated)/admin/members/riders/$riderId.activity.tsx`        | 93.8            | 1      | 2       | 0%        | 0.07    | 6.0   |
| `apps/web/src/shared/components/layout/portal-nav.tsx`                                            | 93.8            | 1      | 2       | 0%        | 0.07    | 2.0   |
| `apps/web/src/shared/components/layout/settings-sidebar.tsx`                                      | 93.8            | 1      | 2       | 0%        | 0.06    | 6.0   |
| `apps/web/src/shared/components/ui/sortable.tsx`                                                  | 93.9            | 1      | 1       | 0%        | 0.11    | 42.0  |
| `apps/web/src/features/chat/hooks/use-parties.ts`                                                 | 94.3            | 3      | 0       | 0%        | 0.19    | 272.0 |
| `apps/web/src/features/chat/components/conversation/lesson-attachment/invite.tsx`                 | 94.5            | 1      | 2       | 0%        | 0.05    | 2.0   |
| `apps/web/src/routes/org/$slug/(authenticated)/admin/messages/route.tsx`                          | 94.5            | 1      | 1       | 0%        | 0.09    | 2.0   |
| `apps/web/src/routes/org/$slug/(authenticated)/portal/messages/route.tsx`                         | 94.5            | 1      | 1       | 0%        | 0.09    | 2.0   |
| `apps/web/src/routes/org/$slug/auth/route.tsx`                                                    | 94.5            | 1      | 1       | 0%        | 0.09    | 20.0  |
| `apps/web/src/shared/components/auth/invitation-error.tsx`                                        | 94.5            | 1      | 2       | 0%        | 0.05    | 2.0   |
| `apps/web/src/shared/components/fragments/category-dot.tsx`                                       | 94.5            | 3      | 2       | 0%        | 0.06    | 6.0   |
| `apps/web/src/shared/components/fragments/org-logo.tsx`                                           | 94.5            | 8      | 2       | 0%        | 0.06    | 6.0   |
| `apps/web/src/shared/components/ui/input-otp.tsx`                                                 | 94.5            | 3      | 1       | 0%        | 0.09    | 30.0  |
| `apps/web/src/features/lessons/lib/portal-lesson.form.ts`                                         | 94.6            | 2      | 0       | 0%        | 0.18    | 42.0  |
| `apps/web/src/shared/components/ui/tag.tsx`                                                       | 94.7            | 5      | 1       | 0%        | 0.09    | 6.0   |
| `apps/web/src/routes/org/$slug/(authenticated)/admin/route.tsx`                                   | 94.8            | 1      | 1       | 0%        | 0.12    | 12.0  |
| `apps/web/src/shared/components/default-catch-boundary.tsx`                                       | 94.8            | 1      | 1       | 0%        | 0.08    | 6.0   |
| `apps/web/src/shared/components/ui/brand-icons.tsx`                                               | 94.8            | 1      | 0       | 20%       | 0.04    | 2.0   |
| `apps/web/src/features/lessons/hooks/use-lesson-data.ts`                                          | 94.9            | 1      | 0       | 0%        | 0.17    | 132.0 |
| `apps/web/src/features/lessons/lib/new-lesson.form.ts`                                            | 94.9            | 8      | 0       | 0%        | 0.17    | 132.0 |
| `apps/web/src/routes/(authenticated)/route.tsx`                                                   | 94.9            | 1      | 1       | 0%        | 0.12    | 12.0  |
| `apps/web/src/features/notifications/components/index.tsx`                                        | 95.0            | 1      | 2       | 0%        | 0.04    | 2.0   |
| `apps/web/src/features/onboarding/lib/organization/form.ts`                                       | 95.0            | 3      | 2       | 0%        | 0.02    | 6.0   |
| `apps/web/src/shared/components/layout/profile-page.tsx`                                          | 95.1            | 1      | 1       | 0%        | 0.07    | 6.0   |
| `apps/web/src/shared/components/ui/card.tsx`                                                      | 95.1            | 37     | 1       | 0%        | 0.07    | 2.0   |
| `apps/web/src/routes/org/$slug/(authenticated)/admin/messages/index.tsx`                          | 95.3            | 1      | 1       | 0%        | 0.07    | 6.0   |
| `apps/web/src/routes/org/$slug/(authenticated)/portal/messages/index.tsx`                         | 95.3            | 1      | 1       | 0%        | 0.07    | 6.0   |
| `apps/web/src/features/kiosk/lib/permissions.ts`                                                  | 95.4            | 2      | 1       | 0%        | 0.07    | 12.0  |
| `apps/web/src/features/organization/components/guardians/invitation-card.tsx`                     | 95.4            | 1      | 1       | 0%        | 0.06    | 12.0  |
| `apps/web/src/routes/auth/login.tsx`                                                              | 95.4            | 1      | 1       | 0%        | 0.09    | 6.0   |
| `apps/web/src/routes/auth/register.tsx`                                                           | 95.4            | 1      | 1       | 0%        | 0.09    | 6.0   |
| `apps/web/src/routes/auth/route.tsx`                                                              | 95.4            | 1      | 1       | 0%        | 0.10    | 6.0   |
| `apps/web/src/routes/org/$slug/auth/login.tsx`                                                    | 95.4            | 1      | 1       | 0%        | 0.09    | 6.0   |
| `apps/web/src/routes/org/$slug/auth/register.tsx`                                                 | 95.4            | 1      | 1       | 0%        | 0.09    | 6.0   |
| `apps/web/src/shared/components/ui/empty.tsx`                                                     | 95.4            | 23     | 1       | 0%        | 0.06    | 2.0   |
| `apps/web/src/shared/components/ui/timeline.tsx`                                                  | 95.4            | 5      | 1       | 0%        | 0.06    | 2.0   |
| `apps/web/src/shared/components/ui/alert.tsx`                                                     | 95.7            | 9      | 1       | 0%        | 0.05    | 2.0   |
| `apps/web/src/shared/components/ui/scroll-area.tsx`                                               | 95.7            | 13     | 1       | 0%        | 0.05    | 6.0   |
| `apps/web/src/features/calendar/lib/search-params.ts`                                             | 96.0            | 4      | 1       | 0%        | 0.08    | 2.0   |
| `apps/web/src/features/organization/components/activity/item.tsx`                                 | 96.0            | 2      | 1       | 0%        | 0.13    | 6.0   |
| `apps/web/src/routes/org/$slug/(authenticated)/admin/messages/$conversationId.tsx`                | 96.0            | 1      | 1       | 0%        | 0.06    | 2.0   |
| `apps/web/src/routes/org/$slug/(authenticated)/portal/messages/$conversationId.tsx`               | 96.0            | 1      | 1       | 0%        | 0.06    | 2.0   |
| `apps/web/src/shared/components/layout/annotated.tsx`                                             | 96.0            | 8      | 1       | 0%        | 0.04    | 6.0   |
| `apps/web/src/shared/components/default-not-found.tsx`                                            | 96.1            | 1      | 1       | 0%        | 0.08    | 2.0   |
| `apps/web/src/shared/hooks/use-mobile.ts`                                                         | 96.4            | 13     | 0       | 0%        | 0.26    | 6.0   |
| `apps/web/src/shared/components/ui/button.tsx`                                                    | 96.6            | 125    | 1       | 0%        | 0.02    | 2.0   |
| `apps/web/src/shared/components/ui/checkbox.tsx`                                                  | 96.6            | 7      | 1       | 0%        | 0.04    | 2.0   |
| `apps/web/src/shared/components/ui/input.tsx`                                                     | 96.6            | 7      | 1       | 0%        | 0.05    | 2.0   |
| `apps/web/src/shared/components/ui/separator.tsx`                                                 | 96.6            | 18     | 1       | 0%        | 0.04    | 2.0   |
| `apps/web/src/shared/components/ui/skeleton.tsx`                                                  | 96.6            | 5      | 1       | 0%        | 0.07    | 2.0   |
| `apps/web/src/features/organization/lib/service.form.ts`                                          | 96.7            | 2      | 0       | 0%        | 0.11    | 20.0  |
| `apps/web/src/routes/auth/forgot-password.tsx`                                                    | 96.7            | 1      | 1       | 0%        | 0.08    | 2.0   |
| `apps/web/src/routes/auth/reset-password.tsx`                                                     | 96.7            | 1      | 1       | 0%        | 0.06    | 2.0   |
| `apps/web/src/routes/org/$slug/auth/forgot-password.tsx`                                          | 96.7            | 1      | 1       | 0%        | 0.08    | 2.0   |
| `apps/web/src/routes/org/$slug/auth/reset-password.tsx`                                           | 96.7            | 1      | 1       | 0%        | 0.06    | 2.0   |
| `apps/web/src/routes/org/$slug.tsx`                                                               | 96.7            | 1      | 0       | 0%        | 0.11    | 30.0  |
| `apps/web/src/shared/components/ui/label.tsx`                                                     | 96.7            | 4      | 1       | 0%        | 0.05    | 2.0   |
| `apps/web/src/shared/components/ui/switch.tsx`                                                    | 96.7            | 7      | 1       | 0%        | 0.03    | 2.0   |
| `apps/web/src/shared/components/ui/textarea.tsx`                                                  | 96.7            | 2      | 1       | 0%        | 0.05    | 2.0   |
| `apps/web/src/shared/lib/config/colors.ts`                                                        | 96.7            | 10     | 0       | 0%        | 0.11    | 30.0  |
| `apps/web/src/features/chat/lib/types.ts`                                                         | 97.0            | 3      | 0       | 0%        | 0.10    | 20.0  |
| `apps/web/src/shared/components/ui/collapsible.tsx`                                               | 98.2            | 7      | 0       | 0%        | 0.15    | 2.0   |
| `apps/web/src/shared/lib/utils/errors.ts`                                                         | 98.2            | 4      | 0       | 0%        | 0.30    | 6.0   |
| `apps/web/src/features/organization/lib/questionnaire.form.ts`                                    | 98.8            | 5      | 0       | 0%        | 0.06    | 6.0   |
| `apps/web/src/routes/org/$slug/(authenticated)/admin/lessons/index.tsx`                           | 99.4            | 1      | 0       | 0%        | 0.08    | 2.0   |
| `apps/web/src/routes/org/$slug/(authenticated)/admin/lessons/new.tsx`                             | 99.4            | 1      | 0       | 0%        | 0.08    | 2.0   |
| `apps/web/src/routes/org/$slug/(authenticated)/admin/members/trainers/$trainerId.tsx`             | 99.4            | 1      | 0       | 0%        | 0.06    | 2.0   |
| `apps/web/src/shared/components/loader.tsx`                                                       | 99.4            | 2      | 0       | 0%        | 0.10    | 2.0   |
| `apps/web/src/shared/components/logo.tsx`                                                         | 99.4            | 2      | 0       | 0%        | 0.03    | 2.0   |
| `apps/web/src/shared/lib/auth/oauth-providers.tsx`                                                | 99.4            | 3      | 0       | 0%        | 0.02    | 2.0   |
| `apps/web/src/shared/lib/utils/export.ts`                                                         | 99.4            | 1      | 0       | 0%        | 0.07    | 2.0   |
| `apps/web/src/shared/lib/utils.ts`                                                                | 99.4            | 111    | 0       | 0%        | 0.14    | 2.0   |
| `apps/web/vite.config.ts`                                                                         | 99.5            | 0      | 0       | 0%        | 0.02    | 2.0   |
| `apps/web/src/shared/lib/navigation/app.ts`                                                       | 99.7            | 4      | 0       | 0%        | 0.01    | 2.0   |

**Average maintainability index:** 89.2/100

### Hotspots (172 files, since 6 months)

| File                                                                                              | Score | Commits | Churn | Density | Fan-in | Trend        |
| :------------------------------------------------------------------------------------------------ | :---- | :------ | :---- | :------ | :----- | :----------- |
| `apps/web/src/routes/org/$slug/(authenticated)/route.tsx`                                         | 38.7  | 9       | 183   | 0.21    | 1      | accelerating |
| `apps/web/src/features/calendar/hooks/use-calendar.tsx`                                           | 36.3  | 10      | 551   | 0.18    | 23     | stable       |
| `apps/web/src/features/calendar/utils/date.ts`                                                    | 34.0  | 7       | 395   | 0.24    | 2      | stable       |
| `apps/web/src/features/lessons/components/modals/new-lesson/scheduling.tsx`                       | 33.8  | 6       | 245   | 0.28    | 1      | cooling      |
| `apps/web/src/routes/org/$slug.tsx`                                                               | 31.4  | 14      | 438   | 0.11    | 1      | accelerating |
| `apps/web/src/shared/components/fragments/user-avatar.tsx`                                        | 28.0  | 6       | 98    | 0.23    | 30     | cooling      |
| `apps/web/src/features/onboarding/components/steps/questionnaire.tsx`                             | 28.0  | 7       | 388   | 0.20    | 2      | cooling      |
| `apps/web/src/features/calendar/components/header/index.tsx`                                      | 26.8  | 9       | 370   | 0.15    | 1      | cooling      |
| `apps/web/src/shared/components/form/select-field.tsx`                                            | 26.3  | 7       | 192   | 0.19    | 1      | cooling      |
| `apps/web/src/features/calendar/components/modals/time-block-form.tsx`                            | 26.2  | 7       | 756   | 0.19    | 2      | cooling      |
| `apps/web/src/features/calendar/components/views/week/index.tsx`                                  | 24.8  | 11      | 470   | 0.11    | 1      | accelerating |
| `apps/web/src/routes/__root.tsx`                                                                  | 24.6  | 12      | 291   | 0.10    | 1      | accelerating |
| `apps/web/src/features/calendar/components/views/day/index.tsx`                                   | 24.4  | 10      | 453   | 0.12    | 1      | stable       |
| `apps/web/src/features/calendar/components/views/fragments/lesson-block.tsx`                      | 24.0  | 8       | 434   | 0.15    | 3      | cooling      |
| `apps/web/src/features/lessons/components/modals/new-lesson/index.tsx`                            | 23.4  | 6       | 448   | 0.19    | 4      | stable       |
| `apps/web/src/features/lessons/components/form/choices.tsx`                                       | 23.3  | 6       | 335   | 0.20    | 1      | accelerating |
| `apps/web/src/features/organization/components/business-hours/day-row.tsx`                        | 22.4  | 8       | 946   | 0.14    | 1      | cooling      |
| `apps/web/src/features/organization/components/levels/level-badge.tsx`                            | 22.0  | 3       | 42    | 0.35    | 5      | cooling      |
| `apps/web/src/features/calendar/components/modals/event-modal.tsx`                                | 21.8  | 4       | 343   | 0.27    | 3      | cooling      |
| `apps/web/src/routes/org/$slug/(authenticated)/admin/index.tsx`                                   | 21.8  | 12      | 763   | 0.09    | 1      | stable       |
| `apps/web/src/routes/org/$slug/(authenticated)/admin/route.tsx`                                   | 21.4  | 9       | 87    | 0.12    | 1      | stable       |
| `apps/web/src/features/calendar/components/header/filters.tsx`                                    | 21.1  | 5       | 464   | 0.21    | 3      | stable       |
| `apps/web/src/routes/org/$slug/(authenticated)/settings/account/profile/-details.tsx`             | 21.0  | 8       | 353   | 0.13    | 1      | accelerating |
| `apps/web/src/features/organization/components/questionnaires/question-builder.tsx`               | 20.8  | 5       | 330   | 0.21    | 2      | cooling      |
| `apps/web/src/routes/org/$slug/(authenticated)/portal/calendar/index.tsx`                         | 20.7  | 8       | 298   | 0.13    | 1      | cooling      |
| `apps/web/src/routes/org/$slug/(authenticated)/admin/services/$id.edit.tsx`                       | 20.6  | 8       | 398   | 0.13    | 1      | cooling      |
| `apps/web/src/routes/org/$slug/(authenticated)/admin/services/new.tsx`                            | 20.6  | 8       | 407   | 0.13    | 1      | cooling      |
| `apps/web/src/routes/org/$slug/(non-member)/route.tsx`                                            | 20.1  | 5       | 169   | 0.19    | 1      | cooling      |
| `apps/web/src/routes/org/$slug/(authenticated)/portal/lessons/create.tsx`                         | 19.4  | 5       | 701   | 0.19    | 1      | accelerating |
| `apps/web/src/features/lessons/lib/portal-lesson.form.ts`                                         | 18.8  | 5       | 102   | 0.18    | 2      | cooling      |
| `apps/web/src/routes/org/$slug/(authenticated)/portal/route.tsx`                                  | 18.7  | 7       | 376   | 0.13    | 1      | accelerating |
| `apps/web/src/features/onboarding/components/steps/personal-details.tsx`                          | 18.6  | 5       | 207   | 0.19    | 3      | stable       |
| `apps/web/src/features/organization/components/feed/post/index.tsx`                               | 18.1  | 4       | 283   | 0.22    | 2      | accelerating |
| `apps/web/src/routes/org/$slug/(authenticated)/settings/organization/members/-invitations.tsx`    | 18.0  | 8       | 379   | 0.11    | 1      | stable       |
| `apps/web/src/features/lessons/components/modals/new-lesson/riders.tsx`                           | 18.0  | 5       | 94    | 0.18    | 1      | cooling      |
| `apps/web/src/routes/org/$slug/(authenticated)/admin/boards/$id.edit.tsx`                         | 17.3  | 8       | 344   | 0.11    | 1      | cooling      |
| `apps/web/src/features/calendar/utils/lesson.ts`                                                  | 17.2  | 5       | 133   | 0.17    | 3      | stable       |
| `apps/web/src/features/calendar/components/views/fragments/hour-cell.tsx`                         | 17.1  | 7       | 238   | 0.12    | 3      | accelerating |
| `apps/web/src/features/lessons/lib/new-lesson.form.ts`                                            | 17.1  | 5       | 166   | 0.17    | 8      | cooling      |
| `apps/web/src/features/organization/components/members/modals/edit-rider.tsx`                     | 17.0  | 5       | 196   | 0.17    | 2      | cooling      |
| `apps/web/src/routes/org/$slug/(authenticated)/admin/members/-columns.tsx`                        | 16.7  | 6       | 270   | 0.14    | 1      | cooling      |
| `apps/web/src/routes/org/$slug/(authenticated)/admin/members/riders/-columns.tsx`                 | 16.2  | 5       | 245   | 0.16    | 1      | cooling      |
| `apps/web/src/shared/hooks/use-mobile.ts`                                                         | 15.3  | 3       | 50    | 0.26    | 13     | cooling      |
| `apps/web/src/features/organization/components/questionnaires/rule-builder.tsx`                   | 15.2  | 4       | 201   | 0.19    | 2      | cooling      |
| `apps/web/src/features/organization/components/questionnaires/conditions-builder.tsx`             | 15.2  | 4       | 240   | 0.19    | 1      | cooling      |
| `apps/web/src/features/calendar/components/mobile/day.tsx`                                        | 15.1  | 6       | 589   | 0.12    | 1      | cooling      |
| `apps/web/src/features/lessons/components/modals/view-lesson/riders-list.tsx`                     | 14.9  | 5       | 152   | 0.15    | 1      | cooling      |
| `apps/web/src/features/organization/components/members/modals/role-modal.tsx`                     | 14.9  | 5       | 162   | 0.15    | 3      | cooling      |
| `apps/web/src/features/lessons/components/modals/new-lesson/details.tsx`                          | 14.6  | 4       | 196   | 0.18    | 1      | stable       |
| `apps/web/src/features/calendar/components/views/fragments/timeline.tsx`                          | 14.6  | 4       | 91    | 0.18    | 4      | stable       |
| `apps/web/src/routes/org/$slug/(authenticated)/admin/calendar/new.tsx`                            | 14.4  | 6       | 159   | 0.12    | 1      | cooling      |
| `apps/web/src/features/organization/lib/board.form.ts`                                            | 14.3  | 3       | 70    | 0.24    | 2      | cooling      |
| `apps/web/src/routes/(authenticated)/create-organization.tsx`                                     | 14.0  | 7       | 628   | 0.10    | 1      | stable       |
| `apps/web/src/routes/org/$slug/(authenticated)/admin/services/index.tsx`                          | 13.8  | 7       | 733   | 0.10    | 1      | cooling      |
| `apps/web/src/features/onboarding/components/steps/waiver.tsx`                                    | 13.5  | 4       | 130   | 0.17    | 2      | accelerating |
| `apps/web/src/features/onboarding/components/wizard.tsx`                                          | 13.4  | 4       | 188   | 0.17    | 2      | accelerating |
| `apps/web/src/shared/components/form/submit-button.tsx`                                           | 13.2  | 4       | 43    | 0.17    | 1      | stable       |
| `apps/web/src/features/lessons/components/modals/view-lesson/lesson-details.tsx`                  | 13.2  | 6       | 246   | 0.11    | 1      | cooling      |
| `apps/web/src/routes/org/$slug/(authenticated)/admin/boards/new.tsx`                              | 13.0  | 6       | 201   | 0.11    | 1      | accelerating |
| `apps/web/src/routes/org/$slug/(authenticated)/portal/index.tsx`                                  | 12.9  | 8       | 508   | 0.08    | 1      | accelerating |
| `apps/web/src/routes/org/$slug/(non-member)/onboarding.tsx`                                       | 12.7  | 4       | 533   | 0.15    | 1      | stable       |
| `apps/web/src/features/organization/components/feed/composer.tsx`                                 | 12.5  | 3       | 306   | 0.21    | 2      | cooling      |
| `apps/web/src/shared/components/form/text-field.tsx`                                              | 12.4  | 4       | 96    | 0.16    | 1      | stable       |
| `apps/web/src/routes/org/$slug/(authenticated)/admin/boards/index.tsx`                            | 12.4  | 7       | 373   | 0.09    | 1      | cooling      |
| `apps/web/src/features/calendar/components/views/day/column.tsx`                                  | 12.2  | 5       | 127   | 0.12    | 2      | stable       |
| `apps/web/src/features/lessons/components/modals/view-lesson/index.tsx`                           | 12.1  | 4       | 222   | 0.15    | 5      | stable       |
| `apps/web/src/features/organization/components/guardians/controls-modal.tsx`                      | 12.1  | 4       | 217   | 0.15    | 1      | stable       |
| `apps/web/src/features/organization/components/feed/filters.tsx`                                  | 11.9  | 3       | 651   | 0.20    | 2      | cooling      |
| `apps/web/src/routes/org/$slug/(authenticated)/admin/members/index.tsx`                           | 11.9  | 6       | 134   | 0.10    | 1      | cooling      |
| `apps/web/src/main.tsx`                                                                           | 11.9  | 5       | 182   | 0.12    | 2      | accelerating |
| `apps/web/src/routes/auth/callback.tsx`                                                           | 11.7  | 3       | 122   | 0.19    | 1      | cooling      |
| `apps/web/src/features/lessons/components/modals/view-lesson/portal-actions.tsx`                  | 11.6  | 3       | 178   | 0.19    | 1      | accelerating |
| `apps/web/src/features/calendar/components/index.tsx`                                             | 11.5  | 3       | 31    | 0.19    | 3      | accelerating |
| `apps/web/src/features/lessons/components/fragments/lesson-card/date-chip.tsx`                    | 11.4  | 5       | 352   | 0.11    | 2      | cooling      |
| `apps/web/src/shared/components/layout/user-dropdown.tsx`                                         | 11.2  | 7       | 295   | 0.08    | 2      | stable       |
| `apps/web/src/shared/components/form/clearable-select-field.tsx`                                  | 11.1  | 3       | 124   | 0.19    | 1      | accelerating |
| `apps/web/src/features/calendar/components/views/agenda/index.tsx`                                | 11.0  | 5       | 142   | 0.11    | 1      | cooling      |
| `apps/web/src/features/onboarding/lib/member/questionnaire.schema.ts`                             | 10.9  | 3       | 179   | 0.18    | 3      | cooling      |
| `apps/web/src/routes/org/$slug/(authenticated)/admin/calendar/index.tsx`                          | 10.9  | 5       | 391   | 0.11    | 1      | stable       |
| `apps/web/src/features/organization/components/members/profile/rider/tabs/lessons.tsx`            | 10.8  | 3       | 87    | 0.18    | 0      | cooling      |
| `apps/web/src/features/organization/components/business-hours/tabs.tsx`                           | 10.7  | 3       | 281   | 0.17    | 2      | cooling      |
| `apps/web/src/shared/components/layout/page.tsx`                                                  | 10.7  | 6       | 122   | 0.09    | 15     | stable       |
| `apps/web/src/routes/org/$slug/(authenticated)/settings/organization/members/-invite.tsx`         | 10.6  | 4       | 133   | 0.13    | 1      | stable       |
| `apps/web/src/routeTree.gen.ts`                                                                   | 10.4  | 13      | 7123  | 0.04    | 1      | stable       |
| `apps/web/src/routes/org/$slug/(authenticated)/settings/organization/general/-logo.tsx`           | 10.4  | 4       | 277   | 0.13    | 1      | stable       |
| `apps/web/src/shared/components/layout/header-search.tsx`                                         | 10.2  | 3       | 291   | 0.17    | 1      | accelerating |
| `apps/web/src/shared/lib/navigation/links.ts`                                                     | 10.1  | 3       | 73    | 0.16    | 2      | cooling      |
| `apps/web/src/shared/components/form/checkbox-field.tsx`                                          | 9.9   | 5       | 66    | 0.10    | 1      | stable       |
| `apps/web/src/shared/components/auth/login-form.tsx`                                              | 9.8   | 6       | 430   | 0.08    | 2      | accelerating |
| `apps/web/src/features/organization/components/guardians/dependent-profile-modal.tsx`             | 9.7   | 4       | 196   | 0.12    | 1      | stable       |
| `apps/web/src/features/organization/components/levels/modal.tsx`                                  | 9.6   | 3       | 182   | 0.16    | 2      | cooling      |
| `apps/web/src/features/calendar/components/views/multi-day/index.tsx`                             | 9.6   | 3       | 307   | 0.15    | 1      | accelerating |
| `apps/web/src/routes/org/$slug/(authenticated)/admin/members/trainers/-columns.tsx`               | 9.6   | 4       | 139   | 0.12    | 1      | cooling      |
| `apps/web/src/routes/org/$slug/(authenticated)/settings/organization/business-hours.tsx`          | 9.6   | 8       | 729   | 0.06    | 1      | cooling      |
| `apps/web/src/features/onboarding/components/modals/add-dependent.tsx`                            | 9.4   | 3       | 298   | 0.15    | 1      | cooling      |
| `apps/web/src/routes/(authenticated)/route.tsx`                                                   | 9.4   | 4       | 54    | 0.12    | 1      | stable       |
| `apps/web/src/shared/lib/config/colors.ts`                                                        | 9.3   | 4       | 213   | 0.11    | 10     | cooling      |
| `apps/web/src/routes/org/$slug/auth/route.tsx`                                                    | 9.2   | 5       | 79    | 0.09    | 1      | cooling      |
| `apps/web/src/routes/org/$slug/auth/login.tsx`                                                    | 9.2   | 5       | 100   | 0.09    | 1      | stable       |
| `apps/web/src/features/organization/components/members/profile/rider/overview/boards.tsx`         | 9.0   | 3       | 141   | 0.15    | 1      | cooling      |
| `apps/web/src/features/organization/components/members/profile/rider/overview/level.tsx`          | 9.0   | 3       | 123   | 0.15    | 1      | cooling      |
| `apps/web/src/features/organization/components/waivers/waiver-modal.tsx`                          | 9.0   | 3       | 172   | 0.15    | 2      | cooling      |
| `apps/web/src/shared/components/layout/settings-page.tsx`                                         | 8.9   | 5       | 161   | 0.09    | 1      | cooling      |
| `apps/web/src/shared/components/form/color-picker-field.tsx`                                      | 8.9   | 3       | 32    | 0.15    | 1      | accelerating |
| `apps/web/src/features/organization/components/business-hours/form.tsx`                           | 8.8   | 3       | 231   | 0.14    | 2      | cooling      |
| `apps/web/src/features/organization/lib/service.form.ts`                                          | 8.7   | 4       | 130   | 0.11    | 2      | cooling      |
| `apps/web/src/features/lessons/components/form/riders.tsx`                                        | 8.6   | 3       | 238   | 0.15    | 1      | cooling      |
| `apps/web/src/features/organization/components/members/profile/overview.tsx`                      | 8.6   | 4       | 82    | 0.11    | 1      | cooling      |
| `apps/web/src/shared/components/form/multiselect-field.tsx`                                       | 8.5   | 4       | 132   | 0.11    | 1      | accelerating |
| `apps/web/src/features/onboarding/components/steps/organization-details.tsx`                      | 8.3   | 3       | 107   | 0.14    | 1      | accelerating |
| `apps/web/src/features/lessons/components/fragments/lesson-card/index.tsx`                        | 8.3   | 4       | 290   | 0.10    | 7      | cooling      |
| `apps/web/src/routes/org/$slug/(authenticated)/kiosk/$sessionId/calendar.tsx`                     | 7.9   | 3       | 191   | 0.13    | 1      | cooling      |
| `apps/web/src/features/kiosk/components/act-as-modal.tsx`                                         | 7.9   | 4       | 151   | 0.10    | 4      | cooling      |
| `apps/web/src/routes/org/$slug/(authenticated)/settings/organization/general/-details.tsx`        | 7.9   | 4       | 141   | 0.10    | 1      | cooling      |
| `apps/web/src/routes/org/$slug/(authenticated)/admin/feed.tsx`                                    | 7.7   | 3       | 307   | 0.13    | 1      | cooling      |
| `apps/web/src/features/onboarding/components/steps/organization-setup.tsx`                        | 7.7   | 3       | 115   | 0.13    | 1      | accelerating |
| `apps/web/src/features/lessons/components/fragments/lesson-card/detail.tsx`                       | 7.5   | 3       | 331   | 0.12    | 1      | cooling      |
| `apps/web/src/features/lessons/components/form/information.tsx`                                   | 7.5   | 3       | 163   | 0.13    | 1      | cooling      |
| `apps/web/src/shared/components/auth/register-form.tsx`                                           | 7.4   | 4       | 359   | 0.09    | 2      | accelerating |
| `apps/web/src/routes/(authenticated)/index.tsx`                                                   | 7.4   | 6       | 315   | 0.06    | 1      | cooling      |
| `apps/web/src/routes/auth/login.tsx`                                                              | 7.3   | 4       | 46    | 0.09    | 1      | accelerating |
| `apps/web/src/routes/auth/register.tsx`                                                           | 7.3   | 4       | 200   | 0.09    | 1      | stable       |
| `apps/web/src/routes/org/$slug/auth/register.tsx`                                                 | 7.3   | 4       | 58    | 0.09    | 1      | stable       |
| `apps/web/src/routes/org/$slug/(authenticated)/settings/organization/questionnaires/new.tsx`      | 7.2   | 3       | 188   | 0.12    | 1      | cooling      |
| `apps/web/src/routes/org/$slug/(authenticated)/settings/account/availability.tsx`                 | 7.1   | 7       | 792   | 0.05    | 1      | stable       |
| `apps/web/src/shared/components/form/radio-field.tsx`                                             | 7.1   | 4       | 106   | 0.09    | 1      | accelerating |
| `apps/web/src/features/onboarding/components/steps/account-type.tsx`                              | 6.8   | 3       | 307   | 0.11    | 1      | cooling      |
| `apps/web/src/features/organization/components/members/profile/rider/overview/index.tsx`          | 6.6   | 3       | 141   | 0.11    | 0      | cooling      |
| `apps/web/src/routes/org/$slug/(authenticated)/settings/account/security/-change-password.tsx`    | 6.5   | 3       | 142   | 0.11    | 1      | accelerating |
| `apps/web/src/features/organization/components/activity/enrollment.tsx`                           | 6.4   | 4       | 110   | 0.08    | 1      | cooling      |
| `apps/web/src/routes/org/$slug/(authenticated)/admin/services/$id.index.tsx`                      | 6.2   | 4       | 244   | 0.08    | 1      | cooling      |
| `apps/web/src/shared/components/fragments/org-logo.tsx`                                           | 6.2   | 5       | 50    | 0.06    | 8      | stable       |
| `apps/web/src/routes/org/$slug/(authenticated)/settings/account/guardian.tsx`                     | 6.1   | 5       | 610   | 0.06    | 1      | accelerating |
| `apps/web/src/features/calendar/components/header/date-navigator.tsx`                             | 6.1   | 5       | 273   | 0.06    | 1      | stable       |
| `apps/web/src/shared/components/auth/impersonation-banner.tsx`                                    | 6.1   | 3       | 44    | 0.10    | 2      | accelerating |
| `apps/web/src/routes/auth/route.tsx`                                                              | 6.1   | 3       | 44    | 0.10    | 1      | accelerating |
| `apps/web/src/routes/org/$slug/(authenticated)/settings/organization/questionnaires/$id.edit.tsx` | 5.9   | 3       | 185   | 0.10    | 1      | cooling      |
| `apps/web/src/routes/org/$slug/(authenticated)/admin/boards/$id.index.tsx`                        | 5.4   | 4       | 211   | 0.07    | 1      | stable       |
| `apps/web/src/features/calendar/components/header/view-switcher.tsx`                              | 5.3   | 3       | 136   | 0.09    | 1      | cooling      |
| `apps/web/src/routes/org/$slug/(authenticated)/admin/members/riders/$riderId.tsx`                 | 5.1   | 5       | 527   | 0.05    | 1      | cooling      |
| `apps/web/src/shared/components/ui/avatar.tsx`                                                    | 5.0   | 5       | 164   | 0.05    | 17     | stable       |
| `apps/web/src/routes/org/$slug/(authenticated)/kiosk/$sessionId/route.tsx`                        | 5.0   | 3       | 56    | 0.08    | 1      | accelerating |
| `apps/web/src/features/onboarding/components/modals/guardian-invitation.tsx`                      | 5.0   | 3       | 190   | 0.08    | 2      | accelerating |
| `apps/web/src/shared/lib/navigation/settings.ts`                                                  | 4.8   | 5       | 139   | 0.05    | 3      | stable       |
| `apps/web/src/features/calendar/lib/constants.ts`                                                 | 4.8   | 4       | 23    | 0.06    | 9      | stable       |
| `apps/web/src/routes/org/$slug/(authenticated)/settings/organization/general/-levels.tsx`         | 4.7   | 3       | 170   | 0.08    | 1      | cooling      |
| `apps/web/src/shared/components/ui/sheet.tsx`                                                     | 4.7   | 3       | 147   | 0.08    | 8      | cooling      |
| `apps/web/src/routes/org/$slug/(authenticated)/settings/route.tsx`                                | 4.7   | 4       | 65    | 0.06    | 1      | cooling      |
| `apps/web/src/features/calendar/lib/search-params.ts`                                             | 4.7   | 3       | 36    | 0.08    | 4      | cooling      |
| `apps/web/src/routes/org/$slug/(authenticated)/settings/organization/general/-socials.tsx`        | 4.2   | 3       | 108   | 0.07    | 1      | cooling      |
| `apps/web/src/routes/org/$slug/(authenticated)/index.tsx`                                         | 4.1   | 3       | 95    | 0.07    | 1      | cooling      |
| `apps/web/src/routes/org/$slug/(authenticated)/settings/index.tsx`                                | 4.0   | 4       | 139   | 0.05    | 1      | stable       |
| `apps/web/src/features/onboarding/lib/member/form.ts`                                             | 4.0   | 4       | 253   | 0.05    | 5      | stable       |
| `apps/web/src/shared/components/ui/dropdown-menu.tsx`                                             | 3.5   | 3       | 275   | 0.06    | 24     | cooling      |
| `apps/web/src/features/onboarding/lib/organization/validators.ts`                                 | 3.1   | 4       | 122   | 0.04    | 3      | stable       |
| `apps/web/src/routes/org/$slug/(authenticated)/settings/organization/waivers/index.tsx`           | 3.1   | 4       | 388   | 0.04    | 1      | cooling      |
| `apps/web/src/shared/components/ui/scroll-area.tsx`                                               | 3.1   | 3       | 75    | 0.05    | 13     | accelerating |
| `apps/web/src/shared/components/ui/select.tsx`                                                    | 3.0   | 3       | 208   | 0.05    | 12     | accelerating |
| `apps/web/src/shared/components/modals.tsx`                                                       | 3.0   | 5       | 32    | 0.03    | 1      | cooling      |
| `apps/web/src/shared/components/ui/command.tsx`                                                   | 3.0   | 3       | 207   | 0.05    | 6      | accelerating |
| `apps/web/src/routes/(authenticated)/join-organization.tsx`                                       | 3.0   | 3       | 103   | 0.05    | 1      | cooling      |
| `apps/web/src/shared/components/layout/app-sidebar.tsx`                                           | 2.9   | 3       | 69    | 0.05    | 1      | cooling      |
| `apps/web/vite.config.ts`                                                                         | 2.8   | 7       | 62    | 0.02    | 0      | stable       |
| `apps/web/src/routes/org/$slug/(authenticated)/settings/organization/members/index.tsx`           | 2.5   | 3       | 51    | 0.04    | 3      | accelerating |
| `apps/web/src/shared/components/ui/badge.tsx`                                                     | 2.0   | 5       | 74    | 0.02    | 35     | accelerating |
| `apps/web/src/features/onboarding/lib/organization/form.ts`                                       | 2.0   | 5       | 144   | 0.02    | 3      | cooling      |
| `apps/web/src/shared/components/layout/app-header.tsx`                                            | 1.9   | 3       | 170   | 0.03    | 1      | accelerating |
| `apps/web/src/features/organization/components/members/profile/rider/tabs/activity.tsx`           | 1.8   | 3       | 43    | 0.03    | 0      | cooling      |
| `apps/web/src/routes/org/$slug/(authenticated)/settings/organization/general/index.tsx`           | 1.8   | 3       | 95    | 0.03    | 4      | accelerating |
| `apps/web/src/routes/org/$slug/(authenticated)/settings/organization/questionnaires/index.tsx`    | 1.8   | 3       | 174   | 0.03    | 1      | cooling      |
| `apps/web/src/shared/components/ui/button.tsx`                                                    | 1.2   | 3       | 62    | 0.02    | 125    | accelerating |
| `apps/web/src/shared/lib/navigation/app.ts`                                                       | 1.2   | 6       | 185   | 0.01    | 4      | stable       |

_178 files excluded (< 3 commits)_

### Refactoring Targets (40)

| Efficiency | Category            | Effort / Confidence | File                                                                                           | Recommendation                                             |
| :--------- | :------------------ | :------------------ | :--------------------------------------------------------------------------------------------- | :--------------------------------------------------------- |
| 15.2       | dead code           | medium / high       | `apps/web/src/shared/components/data-table/toolbar/index.tsx`                                  | Remove 2 unused exports to reduce surface area (67% dead)  |
| 15.1       | dead code           | medium / high       | `apps/web/src/features/calendar/utils/date.ts`                                                 | Remove 2 unused exports to reduce surface area (50% dead)  |
| 13.5       | circular dependency | low / high          | `apps/web/src/shared/components/form/text-field.tsx`                                           | Break import cycle to reduce change cascade risk           |
| 13.1       | dead code           | medium / high       | `apps/web/src/shared/lib/search/table.ts`                                                      | Remove 6 unused exports to reduce surface area (86% dead)  |
| 12.9       | circular dependency | low / high          | `apps/web/src/shared/components/form/submit-button.tsx`                                        | Break import cycle to reduce change cascade risk           |
| 12.3       | dead code           | medium / high       | `apps/web/src/features/calendar/lib/constants.ts`                                              | Remove 5 unused exports to reduce surface area (56% dead)  |
| 12.3       | dead code           | medium / high       | `apps/web/src/shared/components/ui/number-field.tsx`                                           | Remove 6 unused exports to reduce surface area (100% dead) |
| 12.3       | circular dependency | low / high          | `apps/web/src/shared/components/form/color-picker-field.tsx`                                   | Break import cycle to reduce change cascade risk           |
| 11.9       | dead code           | medium / high       | `apps/web/src/shared/lib/navigation/links.ts`                                                  | Remove 5 unused exports to reduce surface area (71% dead)  |
| 11.8       | dead code           | medium / high       | `apps/web/src/features/onboarding/lib/member/questionnaire.schema.ts`                          | Remove 3 unused exports to reduce surface area (60% dead)  |
| 11.4       | dead code           | medium / high       | `apps/web/src/shared/components/ui/button-group.tsx`                                           | Remove 3 unused exports to reduce surface area (75% dead)  |
| 11.1       | circular dependency | low / high          | `apps/web/src/shared/components/form/checkbox-field.tsx`                                       | Break import cycle to reduce change cascade risk           |
| 10.6       | dead code           | medium / high       | `apps/web/src/shared/components/ui/progress.tsx`                                               | Remove 4 unused exports to reduce surface area (80% dead)  |
| 10.6       | dead code           | medium / high       | `apps/web/src/shared/lib/auth/roles.ts`                                                        | Remove 5 unused exports to reduce surface area (50% dead)  |
| 10.2       | circular dependency | low / high          | `apps/web/src/shared/components/form/date-field.tsx`                                           | Break import cycle to reduce change cascade risk           |
| 9.8        | dead code           | medium / high       | `apps/web/src/shared/lib/navigation/settings.ts`                                               | Remove 2 unused exports to reduce surface area (67% dead)  |
| 9.6        | dead code           | high / high         | `apps/web/src/shared/components/ui/dropdown-menu.tsx`                                          | Remove 8 unused exports to reduce surface area (50% dead)  |
| 9.5        | circular dependency | medium / high       | `apps/web/src/routes/org/$slug/(authenticated)/settings/organization/members/-invitations.tsx` | Break import cycle to reduce change cascade risk           |
| 9.4        | dead code           | medium / high       | `apps/web/src/features/onboarding/lib/organization/validators.ts`                              | Remove 2 unused exports to reduce surface area (67% dead)  |
| 9.3        | circular dependency | low / high          | `apps/web/src/shared/components/form/textarea-field.tsx`                                       | Break import cycle to reduce change cascade risk           |
| 9.0        | circular dependency | medium / high       | `apps/web/src/shared/components/form/select-field.tsx`                                         | Break import cycle to reduce change cascade risk           |
| 9.0        | circular dependency | low / high          | `apps/web/src/shared/components/form/phone-field.tsx`                                          | Break import cycle to reduce change cascade risk           |
| 9.0        | circular dependency | low / high          | `apps/web/src/shared/components/form/radio-field.tsx`                                          | Break import cycle to reduce change cascade risk           |
| 8.1        | circular dependency | low / high          | `apps/web/src/shared/components/form/switch-field.tsx`                                         | Break import cycle to reduce change cascade risk           |
| 8.0        | circular dependency | medium / high       | `apps/web/src/routes/org/$slug/(authenticated)/settings/organization/general/index.tsx`        | Break import cycle to reduce change cascade risk           |
| 7.6        | circular dependency | medium / high       | `apps/web/src/shared/components/form/clearable-select-field.tsx`                               | Break import cycle to reduce change cascade risk           |
| 7.6        | circular dependency | medium / high       | `apps/web/src/shared/components/form/datetime-field.tsx`                                       | Break import cycle to reduce change cascade risk           |
| 7.4        | circular dependency | medium / high       | `apps/web/src/routes/org/$slug/(authenticated)/settings/account/profile/-details.tsx`          | Break import cycle to reduce change cascade risk           |
| 6.9        | circular dependency | medium / high       | `apps/web/src/shared/components/form/variants/rider-select-field.tsx`                          | Break import cycle to reduce change cascade risk           |
| 6.8        | circular dependency | medium / high       | `apps/web/src/shared/components/form/variants/trainer-select-field.tsx`                        | Break import cycle to reduce change cascade risk           |
| 6.7        | circular dependency | medium / high       | `apps/web/src/routes/org/$slug/(authenticated)/settings/account/profile/index.tsx`             | Break import cycle to reduce change cascade risk           |
| 6.5        | circular dependency | medium / high       | `apps/web/src/shared/components/form/variants/service-select-field.tsx`                        | Break import cycle to reduce change cascade risk           |
| 6.1        | circular dependency | medium / high       | `apps/web/src/shared/components/form/choice-card-field.tsx`                                    | Break import cycle to reduce change cascade risk           |
| 6.1        | circular dependency | medium / high       | `apps/web/src/routes/org/$slug/(authenticated)/settings/organization/general/-logo.tsx`        | Break import cycle to reduce change cascade risk           |
| 6.0        | circular dependency | medium / high       | `apps/web/src/shared/components/form/variants/password-field.tsx`                              | Break import cycle to reduce change cascade risk           |
| 5.9        | circular dependency | medium / high       | `apps/web/src/routes/org/$slug/(authenticated)/settings/organization/general/-details.tsx`     | Break import cycle to reduce change cascade risk           |
| 5.5        | circular dependency | medium / high       | `apps/web/src/routes/org/$slug/(authenticated)/settings/organization/members/-invite.tsx`      | Break import cycle to reduce change cascade risk           |
| 5.0        | circular dependency | medium / high       | `apps/web/src/routes/org/$slug/(authenticated)/settings/organization/general/-socials.tsx`     | Break import cycle to reduce change cascade risk           |
| 5.0        | circular dependency | medium / high       | `apps/web/src/shared/components/form/multiselect-field.tsx`                                    | Break import cycle to reduce change cascade risk           |
| 4.9        | circular dependency | medium / high       | `apps/web/src/routes/org/$slug/(authenticated)/settings/organization/members/index.tsx`        | Break import cycle to reduce change cascade risk           |

---

<details><summary>Metric definitions</summary>

- **MI** — Maintainability Index (0–100, higher is better)
- **Fan-in** — files that import this file (blast radius)
- **Fan-out** — files this file imports (coupling)
- **Dead Code** — % of value exports with zero references
- **Density** — cyclomatic complexity / lines of code
- **Score** — churn × complexity (0–100, higher = riskier)
- **Commits** — commits in the analysis window
- **Churn** — total lines added + deleted
- **Trend** — accelerating / stable / cooling
- **Efficiency** — priority / effort (higher = better quick-win value, default sort)
- **Category** — recommendation type (churn+complexity, high impact, dead code, complexity, coupling, circular dep)
- **Effort** — estimated effort (low / medium / high) based on file size, function count, and fan-in
- **Confidence** — recommendation reliability (high = deterministic analysis, medium = heuristic, low = git-dependent)

[Full metric reference](https://docs.fallow.tools/explanations/metrics)

</details>
