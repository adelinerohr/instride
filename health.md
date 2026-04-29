● Health score: 73 B
Deductions: circular deps -10.0 · duplication -5.1 · dead exports -3.6 · unused deps -3.0 · complexity -2.5 · dead files -1.4 · unit size -1.0
Tip: add "dist" or "**generated**" to health.ignore in your config to exclude from duplication analysis

■ Metrics: 44,892 LOC · dead files 6.8% · dead exports 18.0% · avg cyclomatic 2.0 · p90 cyclomatic 4 · maintainability 89.2 (good) · 0 churn hotspots · 24 circular deps · 3 unused deps · duplication 10.1%

Function size: 75% low · 12% medium · 6% high · 7% very high (1-15 / 16-30 / 31-60 / >60 LOC)

● Large functions (10 shown, 194 total)
apps/web/src/routes/org/$slug/(authenticated)/portal/lessons/create.tsx
    :68 RouteComponent  382 lines
  apps/web/src/shared/hooks/use-file-upload.ts
    :55 useFileUpload  357 lines
  apps/web/src/features/lessons/components/modals/new-lesson/index.tsx
    :78 LessonModalForm  321 lines
  apps/web/src/routes/org/$slug/(authenticated)/admin/services/$id.edit.tsx
    :40 RouteComponent  285 lines
  apps/web/src/routes/org/$slug/(authenticated)/admin/services/new.tsx
:35 RouteComponent 275 lines
apps/web/src/routes/org/$slug/(non-member)/onboarding.tsx
    :75 RouteComponent  267 lines
  apps/web/src/features/calendar/hooks/use-calendar.tsx
    :70 CalendarProvider  258 lines
  apps/web/src/features/calendar/components/modals/event-modal.tsx
    :48 EventModalForm  254 lines
  apps/web/src/routes/org/$slug/(authenticated)/admin/index.tsx
:84 RouteComponent 250 lines
apps/web/src/routes/org/$slug/(authenticated)/portal/lessons/-booking-calendar.tsx
:33 render 250 lines
Functions exceeding 60 lines of code (very high risk): https://docs.fallow.tools/explanations/health#unit-size
use --top 194 to see all

● High complexity functions (229)
apps/web/src/features/calendar/components/modals/event-modal.tsx
:48 EventModalForm CRITICAL
29 cyclomatic 15 cognitive 254 lines
870.0 CRAP
apps/web/src/features/calendar/components/views/fragments/lesson-block.tsx
:69 LessonBlock CRITICAL
23 cyclomatic 19 cognitive 162 lines
552.0 CRAP
apps/web/src/features/organization/components/business-hours/tabs.tsx
:55 BusinessHoursTabs CRITICAL
22 cyclomatic 22 cognitive 211 lines
506.0 CRAP
apps/web/src/features/chat/components/conversation/bubble.tsx
:16 MessageBubble CRITICAL
20 cyclomatic 16 cognitive 72 lines
420.0 CRAP
apps/web/src/shared/components/data-table/toolbar/index.tsx
:127 onFilterRender CRITICAL
20 cyclomatic 13 cognitive 61 lines
420.0 CRAP
apps/web/src/features/lessons/components/modals/new-lesson/index.tsx
:94 onSubmitInvalid CRITICAL
19 cyclomatic 24 cognitive 53 lines
380.0 CRAP
apps/web/src/shared/hooks/use-file-upload.ts
:170 addFiles CRITICAL
19 cyclomatic 22 cognitive 94 lines
380.0 CRAP
apps/web/src/routes/org/$slug/(non-member)/route.tsx
    :17 beforeLoad CRITICAL
          18 cyclomatic   16 cognitive   63 lines
         342.0 CRAP
  apps/web/src/shared/components/form/choice-card-field.tsx
    :184 <arrow> CRITICAL
          18 cyclomatic   15 cognitive   58 lines
         342.0 CRAP
  apps/web/src/features/lessons/components/modals/view-lesson/portal-actions.tsx
    :20 PortalActions CRITICAL
          17 cyclomatic    8 cognitive  139 lines
         306.0 CRAP
  apps/web/src/routes/auth/callback.tsx
    :26 handleCallback CRITICAL
          16 cyclomatic   16 cognitive   55 lines
         272.0 CRAP
  apps/web/src/features/calendar/components/modals/time-block-form.tsx
    :60 TimeBlockModalForm CRITICAL
          16 cyclomatic   12 cognitive  171 lines
         272.0 CRAP
  apps/web/src/features/lessons/components/fragments/lesson-card/detail.tsx
    :24 LessonCardDetail CRITICAL
          16 cyclomatic   13 cognitive  132 lines
         272.0 CRAP
  apps/web/src/features/chat/hooks/use-parties.ts
    :25 useParties CRITICAL
          16 cyclomatic   14 cognitive   87 lines
         272.0 CRAP
  apps/web/src/routes/org/$slug/(authenticated)/portal/route.tsx
:64 beforeLoad CRITICAL
16 cyclomatic 13 cognitive 103 lines
272.0 CRAP
apps/web/src/features/organization/components/feed/post/index.tsx
:17 Post CRITICAL
15 cyclomatic 12 cognitive 121 lines
240.0 CRAP
apps/web/src/shared/components/form/choice-card-field.tsx
:85 <arrow> CRITICAL
15 cyclomatic 12 cognitive 58 lines
240.0 CRAP
apps/web/src/shared/components/form/variants/password-field.tsx
:28 PasswordField CRITICAL
14 cyclomatic 12 cognitive 86 lines
210.0 CRAP
apps/web/src/features/onboarding/components/modals/add-dependent.tsx
:47 AddDependentModal CRITICAL
14 cyclomatic 11 cognitive 242 lines
210.0 CRAP
apps/web/src/shared/components/form/clearable-select-field.tsx
:38 ClearableSelectField CRITICAL
14 cyclomatic 12 cognitive 79 lines
210.0 CRAP
apps/web/src/routes/org/$slug/(authenticated)/route.tsx
    :15 beforeLoad CRITICAL
          14 cyclomatic   12 cognitive   47 lines
         210.0 CRAP
  apps/web/src/shared/components/ui/time-picker.tsx
    :76 handleKeyDown CRITICAL
          14 cyclomatic   14 cognitive   26 lines
         210.0 CRAP
  apps/web/src/routes/org/$slug/(authenticated)/portal/index.tsx
:78 RouteComponent CRITICAL
13 cyclomatic 12 cognitive 231 lines
182.0 CRAP
apps/web/src/features/lessons/components/modals/new-lesson/details.tsx
:35 render CRITICAL
13 cyclomatic 11 cognitive 149 lines
182.0 CRAP
apps/web/src/features/kiosk/components/lessons/actions.tsx
:19 LessonsActions CRITICAL
13 cyclomatic 9 cognitive 102 lines
182.0 CRAP
apps/web/src/features/organization/components/members/profile/rider/overview/index.tsx
:27 RiderOverview CRITICAL
13 cyclomatic 6 cognitive 87 lines
182.0 CRAP
apps/web/src/features/chat/utils/grouping.ts
:15 <arrow> CRITICAL
13 cyclomatic 9 cognitive 39 lines
182.0 CRAP
apps/web/src/shared/components/form/select-field.tsx
:40 SelectField CRITICAL
13 cyclomatic 11 cognitive 71 lines
182.0 CRAP
apps/web/src/features/lessons/components/modals/new-lesson/scheduling.tsx
:24 render CRITICAL
13 cyclomatic 7 cognitive 127 lines
182.0 CRAP
apps/web/src/routes/org/$slug/(authenticated)/portal/lessons/create.tsx
    :110 onSubmit CRITICAL
          12 cyclomatic   11 cognitive   70 lines
         156.0 CRAP
  apps/web/src/routes/(authenticated)/admin/route.tsx
    :68 RouteComponent CRITICAL
          12 cyclomatic   11 cognitive   43 lines
         156.0 CRAP
  apps/web/src/features/chat/components/conversation/lesson-attachment/card.tsx
    :255 SettledFooter CRITICAL
          12 cyclomatic   11 cognitive   46 lines
         156.0 CRAP
  apps/web/src/features/organization/components/guardians/controls-modal.tsx
    :42 GuardianControlsModalForm CRITICAL
          12 cyclomatic   10 cognitive   82 lines
         156.0 CRAP
  apps/web/src/shared/components/form/variants/rider-select-field.tsx
    :197 ClearableSingleSelectField CRITICAL
          12 cyclomatic   10 cognitive   51 lines
         156.0 CRAP
  apps/web/src/shared/lib/utils/data-table.ts
    :4 getColumnPinningStyle CRITICAL
          12 cyclomatic   14 cognitive   30 lines
         156.0 CRAP
  apps/web/src/routes/org/$slug/(authenticated)/settings/organization/members/-invitations.tsx
:141 MemberRow CRITICAL
12 cyclomatic 6 cognitive 161 lines
156.0 CRAP
apps/web/src/features/onboarding/components/wizard.tsx
:52 <arrow> CRITICAL
12 cyclomatic 10 cognitive 46 lines
156.0 CRAP
apps/web/src/features/organization/components/questionnaires/question-builder.tsx
:30 render CRITICAL
12 cyclomatic 6 cognitive 242 lines
156.0 CRAP
apps/web/src/routes/org/$slug/(authenticated)/portal/lessons/create.tsx
    :68 RouteComponent CRITICAL
          11 cyclomatic   11 cognitive  382 lines
         132.0 CRAP
  apps/web/src/routes/org/$slug/(authenticated)/portal/lessons/-booking-calendar.tsx
:116 <arrow> CRITICAL
11 cyclomatic 9 cognitive 161 lines
132.0 CRAP
apps/web/src/routes/(authenticated)/admin/route.tsx
:51 loader CRITICAL
11 cyclomatic 10 cognitive 15 lines
132.0 CRAP
apps/web/src/features/chat/components/conversation/lesson-attachment/card.tsx
:43 LessonAttachmentCard CRITICAL
11 cyclomatic 9 cognitive 144 lines
132.0 CRAP
apps/web/src/shared/components/fragments/user-avatar.tsx
:16 UserAvatar CRITICAL
11 cyclomatic 4 cognitive 24 lines
132.0 CRAP
apps/web/src/shared/components/form/text-field.tsx
:24 TextField CRITICAL
11 cyclomatic 10 cognitive 61 lines
132.0 CRAP
apps/web/src/features/lessons/hooks/use-lesson-data.ts
:27 useLessonCardData CRITICAL
11 cyclomatic 11 cognitive 39 lines
132.0 CRAP
apps/web/src/features/lessons/lib/new-lesson.form.ts
:28 buildLessonDefaultValues CRITICAL
11 cyclomatic 12 cognitive 43 lines
132.0 CRAP
apps/web/src/shared/components/form/variants/trainer-select-field.tsx
:198 ClearableSingleSelectField CRITICAL
11 cyclomatic 9 cognitive 54 lines
132.0 CRAP
apps/web/src/routes/org/$slug/(non-member)/onboarding.tsx
    :75 RouteComponent CRITICAL
          11 cyclomatic    8 cognitive  267 lines
         132.0 CRAP
  apps/web/src/features/lessons/components/modals/view-lesson/index.tsx
    :40 ViewLessonModalForm CRITICAL
          11 cyclomatic    7 cognitive   89 lines
         132.0 CRAP
  apps/web/src/features/lessons/components/form/create/booking-calendar.tsx
    :31 BookingCalendar CRITICAL
          11 cyclomatic   11 cognitive  245 lines
         132.0 CRAP
  apps/web/src/routes/__root.tsx
    :23 beforeLoad CRITICAL
          11 cyclomatic    6 cognitive   61 lines
         132.0 CRAP
  apps/web/src/routes/org/$slug/(authenticated)/admin/index.tsx
:84 RouteComponent CRITICAL
11 cyclomatic 11 cognitive 250 lines
132.0 CRAP
apps/web/src/shared/hooks/use-file-upload.ts
:82 validateFile CRITICAL
10 cyclomatic 17 cognitive 34 lines
110.0 CRAP
apps/web/src/features/organization/components/levels/modal.tsx
:38 LevelModalForm CRITICAL
10 cyclomatic 5 cognitive 105 lines
110.0 CRAP
apps/web/src/features/calendar/components/views/fragments/hour-cell.tsx
:33 handleClick CRITICAL
10 cyclomatic 9 cognitive 39 lines
110.0 CRAP
apps/web/src/shared/components/form/datetime-field.tsx
:47 handleTimeChange CRITICAL
10 cyclomatic 11 cognitive 23 lines
110.0 CRAP
apps/web/src/features/organization/components/feed/post/comment-item.tsx
:39 CommentItem CRITICAL
10 cyclomatic 7 cognitive 71 lines
110.0 CRAP
apps/web/src/routes/org/$slug/(non-member)/onboarding.tsx
    :167 onSubmit CRITICAL
          10 cyclomatic   10 cognitive   54 lines
         110.0 CRAP
  apps/web/src/features/calendar/components/header/index.tsx
    :33 getVisibility CRITICAL
          10 cyclomatic   14 cognitive   21 lines
         110.0 CRAP
  apps/web/src/shared/components/form/variants/service-select-field.tsx
    :87 ClearableServiceSelectField CRITICAL
          10 cyclomatic    8 cognitive   50 lines
         110.0 CRAP
  apps/web/src/features/organization/components/feed/post/header.tsx
    :33 PostHeader CRITICAL
          10 cyclomatic    6 cognitive   55 lines
         110.0 CRAP
  apps/web/src/shared/components/ui/file-upload.tsx
    :29 AvatarUpload HIGH
           9 cyclomatic    9 cognitive  212 lines
          90.0 CRAP
  apps/web/src/shared/components/data-table/toolbar/sort-list.tsx
    :124 onKeyDown HIGH
           9 cyclomatic    6 cognitive   19 lines
          90.0 CRAP
  apps/web/src/features/calendar/utils/date.ts
    :40 navigateDate HIGH
           9 cyclomatic    9 cognitive   24 lines
          90.0 CRAP
  apps/web/src/features/organization/components/waivers/waiver-modal.tsx
    :38 WaiverModalForm HIGH
           9 cyclomatic    5 cognitive   97 lines
          90.0 CRAP
  apps/web/src/shared/components/data-table/toolbar/date-filter.tsx
    :125 label HIGH
           9 cyclomatic   10 cognitive   47 lines
          90.0 CRAP
  apps/web/src/shared/components/layout/user-dropdown.tsx
    :24 UserDropdown HIGH
           9 cyclomatic    6 cognitive  120 lines
          90.0 CRAP
  apps/web/src/features/organization/components/business-hours/tabs.tsx
    :204 <arrow> HIGH
           9 cyclomatic    8 cognitive   58 lines
          90.0 CRAP
  apps/web/src/shared/components/layout/app-layout.tsx
    :18 AppLayout HIGH
           9 cyclomatic    6 cognitive   22 lines
          90.0 CRAP
  apps/web/src/features/onboarding/components/modals/add-dependent.tsx
    :109 onSubmit HIGH
           9 cyclomatic   13 cognitive   45 lines
          90.0 CRAP
  apps/web/src/features/organization/components/members/list/card.tsx
    :19 MemberCard HIGH
           9 cyclomatic    6 cognitive   82 lines
          90.0 CRAP
  apps/web/src/shared/hooks/use-data-table.ts
    :25 useDataTable HIGH
           9 cyclomatic    6 cognitive  193 lines
          90.0 CRAP
  apps/web/src/features/lessons/components/modals/view-lesson/riders-list.tsx
    :22 RidersList HIGH
           9 cyclomatic    5 cognitive   87 lines
          90.0 CRAP
  apps/web/src/shared/components/data-table/column-header.tsx
    :27 DataTableColumnHeader HIGH
           9 cyclomatic    8 cognitive   73 lines
          90.0 CRAP
  apps/web/src/features/lessons/components/modals/new-lesson/riders.tsx
    :22 render HIGH
           8 cyclomatic    4 cognitive   60 lines
          72.0 CRAP
  apps/web/src/routes/org/$slug/(authenticated)/portal/lessons/create.tsx
:385 <arrow> HIGH
8 cyclomatic 6 cognitive 56 lines
72.0 CRAP
apps/web/src/features/lessons/components/modals/new-lesson/index.tsx
:147 onSubmit HIGH
8 cyclomatic 14 cognitive 64 lines
72.0 CRAP
:78 LessonModalForm HIGH
8 cyclomatic 6 cognitive 321 lines
72.0 CRAP
apps/web/src/shared/components/data-table/toolbar/faceted-filter.tsx
:32 DataTableFacetedFilter HIGH
8 cyclomatic 5 cognitive 158 lines
72.0 CRAP
apps/web/src/features/calendar/components/views/fragments/multi-day-row/index.tsx
:175 <arrow> HIGH
8 cyclomatic 8 cognitive 54 lines
72.0 CRAP
apps/web/src/features/calendar/components/header/filters.tsx
:24 CalendarFilters HIGH
8 cyclomatic 7 cognitive 155 lines
72.0 CRAP
apps/web/src/routes/org/$slug/(authenticated)/admin/feed.tsx
    :39 RouteComponent HIGH
           8 cyclomatic    8 cognitive   71 lines
          72.0 CRAP
  apps/web/src/features/organization/components/feed/filters.tsx
    :164 <arrow> HIGH
           8 cyclomatic    3 cognitive   22 lines
          72.0 CRAP
  apps/web/src/features/organization/components/levels/level-badge.tsx
    :11 LevelBadge HIGH
           8 cyclomatic    4 cognitive   12 lines
          72.0 CRAP
  apps/web/src/shared/components/data-table/toolbar/date-filter.tsx
    :83 onSelect HIGH
           8 cyclomatic    8 cognitive   14 lines
          72.0 CRAP
  apps/web/src/shared/components/form/variants/rider-select-field.tsx
    :87 SingleSelectField HIGH
           8 cyclomatic    7 cognitive   44 lines
          72.0 CRAP
  apps/web/src/features/chat/components/sidebar.tsx
    :34 ChatLayout HIGH
           8 cyclomatic    5 cognitive  148 lines
          72.0 CRAP
  apps/web/src/features/lessons/components/form/riders.tsx
    :159 <arrow> HIGH
           8 cyclomatic    4 cognitive   25 lines
          72.0 CRAP
  apps/web/src/routes/org/$slug/(authenticated)/portal/feed.tsx
:37 RouteComponent HIGH
8 cyclomatic 8 cognitive 67 lines
72.0 CRAP
apps/web/src/features/chat/components/conversation-item.tsx
:17 ConversationItem HIGH
8 cyclomatic 6 cognitive 44 lines
72.0 CRAP
apps/web/src/features/chat/components/conversation/list.tsx
:55 renderMessageContent HIGH
8 cyclomatic 5 cognitive 56 lines
72.0 CRAP
apps/web/src/features/organization/components/questionnaires/rule-builder.tsx
:141 <arrow> HIGH
8 cyclomatic 7 cognitive 25 lines
72.0 CRAP
apps/web/src/features/calendar/hooks/use-calendar.tsx
:149 <arrow> HIGH
8 cyclomatic 5 cognitive 28 lines
72.0 CRAP
apps/web/src/features/lessons/components/form/create/index.tsx
:80 CreateLesson HIGH
8 cyclomatic 4 cognitive 238 lines
72.0 CRAP
apps/web/src/shared/components/ui/sidebar.tsx
:150 Sidebar HIGH
8 cyclomatic 7 cognitive 101 lines
72.0 CRAP
apps/web/src/features/calendar/components/views/fragments/multi-day-row/item.tsx
:47 MultiDayRowItem HIGH
8 cyclomatic 5 cognitive 57 lines
72.0 CRAP
apps/web/src/features/organization/components/feed/composer.tsx
:31 PostComposer HIGH
8 cyclomatic 3 cognitive 116 lines
72.0 CRAP
apps/web/src/routes/org/$slug/(authenticated)/admin/members/riders/$riderId.tsx
:47 RouteComponent HIGH
7 cyclomatic 6 cognitive 121 lines
56.0 CRAP
apps/web/src/features/kiosk/components/header.tsx
:16 KioskHeader HIGH
7 cyclomatic 8 cognitive 90 lines
56.0 CRAP
apps/web/src/shared/components/confirmation-modal.tsx
:27 <arrow> HIGH
7 cyclomatic 6 cognitive 30 lines
56.0 CRAP
apps/web/src/shared/components/form/variants/password-field.tsx
:40 getRequirements HIGH
7 cyclomatic 8 cognitive 23 lines
56.0 CRAP
apps/web/src/features/onboarding/components/steps/personal-details.tsx
:111 onSubmit HIGH
7 cyclomatic 6 cognitive 17 lines
56.0 CRAP
apps/web/src/features/lessons/components/form/information.tsx
:35 render HIGH
7 cyclomatic 4 cognitive 122 lines
56.0 CRAP
apps/web/src/features/onboarding/components/steps/questionnaire.tsx
:48 <arrow> HIGH
7 cyclomatic 8 cognitive 29 lines
56.0 CRAP
apps/web/src/features/organization/components/members/invitation-card.tsx
:39 onAnswer HIGH
7 cyclomatic 10 cognitive 30 lines
56.0 CRAP
apps/web/src/features/organization/utils/questionnaire.ts
:9 <arrow> HIGH
7 cyclomatic 6 cognitive 9 lines
56.0 CRAP
apps/web/src/shared/components/data-table/toolbar/sort-list.tsx
:51 DataTableSortList HIGH
7 cyclomatic 6 cognitive 213 lines
56.0 CRAP
apps/web/src/shared/lib/search/table.ts
:40 <arrow> HIGH
7 cyclomatic 6 cognitive 13 lines
56.0 CRAP
apps/web/src/routes/org/$slug/(authenticated)/settings/account/guardian.tsx
    :97 RouteComponent HIGH
           7 cyclomatic    6 cognitive  196 lines
          56.0 CRAP
  apps/web/src/features/calendar/hooks/use-range-swipe.tsx
    :80 onPointerMove HIGH
           7 cyclomatic    6 cognitive   19 lines
          56.0 CRAP
    :103 onPointerUp HIGH
           7 cyclomatic    6 cognitive   24 lines
          56.0 CRAP
  apps/web/src/shared/components/form/variants/trainer-select-field.tsx
    :86 SingleSelectField HIGH
           7 cyclomatic    6 cognitive   47 lines
          56.0 CRAP
  apps/web/src/routes/(authenticated)/create-organization.tsx
    :34 RouteComponent HIGH
           7 cyclomatic    5 cognitive  197 lines
          56.0 CRAP
  apps/web/src/routes/org/$slug/(non-member)/onboarding.tsx
:96 completeOnboarding HIGH
7 cyclomatic 6 cognitive 67 lines
56.0 CRAP
apps/web/src/features/lessons/components/form/riders.tsx
:192 <arrow> HIGH
7 cyclomatic 3 cognitive 24 lines
56.0 CRAP
apps/web/src/shared/hooks/use-hot-key.ts
:14 handler HIGH
7 cyclomatic 4 cognitive 11 lines
56.0 CRAP
apps/web/src/features/organization/components/activity/enrollment.tsx
:37 EnrollmentActivity HIGH
7 cyclomatic 6 cognitive 64 lines
56.0 CRAP
apps/web/src/features/lessons/components/modals/view-lesson/lesson-details.tsx
:18 LessonDetails HIGH
7 cyclomatic 4 cognitive 59 lines
56.0 CRAP
apps/web/src/routes/org/$slug/(authenticated)/admin/members/$id.index.tsx
:25 RouteComponent HIGH
7 cyclomatic 4 cognitive 66 lines
56.0 CRAP
apps/web/src/features/lessons/components/fragments/lesson-card/date-chip.tsx
:13 LessonCardDateChip HIGH
7 cyclomatic 4 cognitive 55 lines
56.0 CRAP
apps/web/src/features/onboarding/lib/member/questionnaire.schema.ts
:37 <arrow> HIGH
7 cyclomatic 5 cognitive 28 lines
56.0 CRAP
apps/web/src/features/organization/components/members/profile/rider/tabs/lessons.tsx
:30 <arrow> HIGH
7 cyclomatic 2 cognitive 16 lines
56.0 CRAP
apps/web/src/main.tsx
:49 input HIGH
7 cyclomatic 7 cognitive 21 lines
56.0 CRAP
apps/web/src/shared/hooks/use-file-upload.ts
:142 <arrow> HIGH
7 cyclomatic 5 cognitive 25 lines
56.0 CRAP
apps/web/src/features/calendar/components/modals/event-modal.tsx
:82 onSubmit HIGH
7 cyclomatic 10 cognitive 49 lines
56.0 CRAP
apps/web/src/features/calendar/utils/multi-day.ts
:8 getMultiDayLayout HIGH
7 cyclomatic 5 cognitive 29 lines
56.0 CRAP
apps/web/src/shared/components/form/choice-card-field.tsx
:55 MultiChoiceCardField HIGH
7 cyclomatic 6 cognitive 93 lines
56.0 CRAP
:149 BooleanChoiceCardField HIGH
7 cyclomatic 6 cognitive 98 lines
56.0 CRAP
apps/web/src/shared/components/ui/field.tsx
:182 content HIGH
7 cyclomatic 3 cognitive 26 lines
56.0 CRAP
apps/web/src/shared/components/form/textarea-field.tsx
:14 TextareaField
6 cyclomatic 5 cognitive 29 lines
42.0 CRAP
apps/web/src/shared/components/form/radio-field.tsx
:26 BooleanRadioField
6 cyclomatic 5 cognitive 55 lines
42.0 CRAP
apps/web/src/features/lessons/components/modals/new-lesson/index.tsx
:286 combine
6 cyclomatic 5 cognitive 8 lines
42.0 CRAP
apps/web/src/features/lessons/lib/portal-lesson.form.ts
:28 buildPortalLessonDefaultValues
6 cyclomatic 5 cognitive 27 lines
42.0 CRAP
apps/web/src/routes/org/$slug/(authenticated)/portal/lessons/-booking-calendar.tsx
    :177 <arrow>
           6 cyclomatic    5 cognitive   29 lines
          42.0 CRAP
  apps/web/src/shared/components/data-table/toolbar/faceted-filter.tsx
    :46 onItemSelect
           6 cyclomatic   10 cognitive   17 lines
          42.0 CRAP
  apps/web/src/features/calendar/components/views/fragments/multi-day-row/index.tsx
    :143 <arrow>
           6 cyclomatic    4 cognitive    9 lines
          42.0 CRAP
  apps/web/src/features/chat/components/conversation/lesson-proposal-modal.tsx
    :66 initialTrainerId
           6 cyclomatic    5 cognitive   16 lines
          42.0 CRAP
  apps/web/src/features/calendar/components/index.tsx
    :12 Calendar
           6 cyclomatic    5 cognitive   20 lines
          42.0 CRAP
  apps/web/src/shared/components/data-table/toolbar/sort-list.tsx
    :65 <arrow>
           6 cyclomatic    6 cognitive   21 lines
          42.0 CRAP
    :291 onItemKeyDown
           6 cyclomatic    5 cognitive   17 lines
          42.0 CRAP
  apps/web/src/shared/components/form/datetime-field.tsx
    :151 <arrow>
           6 cyclomatic    5 cognitive   17 lines
          42.0 CRAP
    :22 DatetimeField
           6 cyclomatic    5 cognitive  156 lines
          42.0 CRAP
  apps/web/src/routes/(authenticated)/admin/-columns.tsx
    :331 cell
           6 cyclomatic    5 cognitive   78 lines
          42.0 CRAP
  apps/web/src/shared/components/fragments/user-avatar.tsx
    :41 UserAvatarItem
           6 cyclomatic    5 cognitive   30 lines
          42.0 CRAP
  apps/web/src/shared/components/data-table/toolbar/date-filter.tsx
    :30 parseColumnFilterValue
           6 cyclomatic    5 cognitive   20 lines
          42.0 CRAP
    :117 formatDateRange
           6 cyclomatic    5 cognitive    7 lines
          42.0 CRAP
  apps/web/src/routes/org/$slug/(authenticated)/admin/services/$id.index.tsx
    :167 <arrow>
           6 cyclomatic    2 cognitive   20 lines
          42.0 CRAP
  apps/web/src/features/organization/components/feed/post/comment-item.tsx
    :141 CommentBody
           6 cyclomatic    3 cognitive  118 lines
          42.0 CRAP
  apps/web/src/shared/components/form/variants/rider-select-field.tsx
    :132 MultiSelectField
           6 cyclomatic    5 cognitive   64 lines
          42.0 CRAP
  apps/web/src/features/chat/components/sidebar.tsx
    :45 groupedConversations
           6 cyclomatic    7 cognitive   40 lines
          42.0 CRAP
  apps/web/src/routes/org/$slug/(authenticated)/settings/account/security/-connected-accounts.tsx
:49 <arrow>
6 cyclomatic 5 cognitive 33 lines
42.0 CRAP
apps/web/src/routes/org/$slug/(authenticated)/settings/account/profile/-details.tsx
    :41 onSubmit
           6 cyclomatic    6 cognitive   64 lines
          42.0 CRAP
  apps/web/src/features/onboarding/components/modals/add-dependent.tsx
    :65 completeDependentOnboarding
           6 cyclomatic    5 cognitive   41 lines
          42.0 CRAP
  apps/web/src/shared/components/layout/settings-page.tsx
    :13 SettingsPage
           6 cyclomatic    6 cognitive  103 lines
          42.0 CRAP
  apps/web/src/routes/(authenticated)/create-organization.tsx
    :42 completeOnboarding
           6 cyclomatic    6 cognitive   63 lines
          42.0 CRAP
    :109 onSubmit
           6 cyclomatic    6 cognitive   37 lines
          42.0 CRAP
  apps/web/src/shared/components/ui/sortable.tsx
    :359 SortableOverlay
           6 cyclomatic    6 cognitive   37 lines
          42.0 CRAP
  apps/web/src/shared/hooks/use-file-upload.ts
    :280 <arrow>
           6 cyclomatic    2 cognitive   20 lines
          42.0 CRAP
    :343 handleDrop
           6 cyclomatic    6 cognitive   20 lines
          42.0 CRAP
  apps/web/src/shared/lib/utils/format.ts
    :71 formatDate
           6 cyclomatic    5 cognitive   17 lines
          42.0 CRAP
  apps/web/src/features/organization/components/members/profile/overview.tsx
    :12 MemberOverview
           6 cyclomatic    1 cognitive   51 lines
          42.0 CRAP
  apps/web/src/features/organization/lib/board.form.ts
    :25 buildBoardDefaultValues
           6 cyclomatic    3 cognitive   16 lines
          42.0 CRAP
  apps/web/src/features/organization/components/feed/post/comment-sheet.tsx
    :40 PostComments
           6 cyclomatic    5 cognitive  122 lines
          42.0 CRAP
  apps/web/src/features/lessons/components/form/create/index.tsx
    :298 <arrow>
           6 cyclomatic    2 cognitive   13 lines
          42.0 CRAP
  apps/web/src/routes/org/$slug/(authenticated)/admin/boards/$id.index.tsx
    :123 <arrow>
           6 cyclomatic    2 cognitive   20 lines
          42.0 CRAP
  apps/web/src/shared/components/form/variants/service-select-field.tsx
    :43 SingleServiceSelectField
           6 cyclomatic    5 cognitive   43 lines
          42.0 CRAP
  apps/web/src/features/lessons/lib/utils.ts
    :61 findNearestLesson
           6 cyclomatic    7 cognitive   19 lines
          42.0 CRAP
  apps/web/src/features/kiosk/components/act-as-modal.tsx
    :45 onSubmit
           6 cyclomatic   11 cognitive   29 lines
          42.0 CRAP
  apps/web/src/features/organization/components/questionnaires/question-builder.tsx
    :207 <arrow>
           6 cyclomatic    3 cognitive   21 lines
          42.0 CRAP
  apps/web/src/shared/components/ui/phone-input.tsx
    :49 PhoneInput
           6 cyclomatic    5 cognitive   39 lines
          42.0 CRAP
  apps/web/src/shared/components/ui/time-picker.tsx
    :63 calculateNewValue
           6 cyclomatic    5 cognitive   12 lines
          42.0 CRAP
  apps/web/src/features/lessons/components/modals/view-lesson/riders-list.tsx
    :65 <arrow>
           6 cyclomatic    4 cognitive   40 lines
          42.0 CRAP
  apps/web/src/routes/org/$slug/(authenticated)/portal/index.tsx
:102 renderGreeting
5 cyclomatic 9 cognitive 26 lines
30.0 CRAP
apps/web/src/routes/org/$slug/(authenticated)/portal/lessons/-booking-calendar.tsx
    :90 <arrow>
           5 cyclomatic    3 cognitive  190 lines
          30.0 CRAP
  apps/web/src/shared/components/form/switch-field.tsx
    :16 SwitchField
           5 cyclomatic    4 cognitive   27 lines
          30.0 CRAP
  apps/web/src/routes/org/$slug/(authenticated)/kiosk/$sessionId/calendar.tsx
    :81 RouteComponent
           5 cyclomatic    6 cognitive   63 lines
          30.0 CRAP
  apps/web/src/features/onboarding/components/steps/questionnaire.tsx
    :178 onSubmit
           5 cyclomatic    4 cognitive   10 lines
          30.0 CRAP
    :189 <arrow>
           5 cyclomatic    4 cognitive   47 lines
          30.0 CRAP
    :128 <arrow>
           5 cyclomatic    3 cognitive  112 lines
          30.0 CRAP
    :31 Render
           5 cyclomatic    2 cognitive  213 lines
          30.0 CRAP
  apps/web/src/features/onboarding/lib/member/form.ts
    :101 buildMemberOnboardingDefaultValues
           5 cyclomatic    5 cognitive   39 lines
          30.0 CRAP
  apps/web/src/features/calendar/components/header/filters.tsx
    :40 <arrow>
           5 cyclomatic    5 cognitive   12 lines
          30.0 CRAP
  apps/web/src/features/calendar/utils/date.ts
    :8 rangeText
           5 cyclomatic    1 cognitive   31 lines
          30.0 CRAP
    :87 getCalendarRange
           5 cyclomatic    6 cognitive   19 lines
          30.0 CRAP
  apps/web/src/features/organization/components/questionnaires/conditions-builder.tsx
    :33 addCondition
           5 cyclomatic    3 cognitive   16 lines
          30.0 CRAP
    :98 <arrow>
           5 cyclomatic    2 cognitive   16 lines
          30.0 CRAP
    :79 <arrow>
           5 cyclomatic    2 cognitive  111 lines
          30.0 CRAP
  apps/web/src/routes/org/$slug/(authenticated)/admin/boards/index.tsx
:71 <arrow>
5 cyclomatic 3 cognitive 87 lines
30.0 CRAP
apps/web/src/shared/components/data-table/toolbar/date-filter.tsx
:64 selectedDates
5 cyclomatic 5 cognitive 17 lines
30.0 CRAP
:108 hasValue
5 cyclomatic 5 cognitive 8 lines
30.0 CRAP
:57 DataTableDateFilter
5 cyclomatic 6 cognitive 169 lines
30.0 CRAP
apps/web/src/routes/org/$slug/(authenticated)/admin/services/$id.index.tsx
:54 RouteComponent
5 cyclomatic 4 cognitive 165 lines
30.0 CRAP
apps/web/src/features/organization/components/feed/post/comment-item.tsx
:117 ReplyItem
5 cyclomatic 2 cognitive 16 lines
30.0 CRAP
apps/web/src/features/calendar/hooks/use-range-swipe.tsx
:153 handler
5 cyclomatic 4 cognitive 14 lines
30.0 CRAP
apps/web/src/routes/org/$slug/(authenticated)/settings/account/profile/index.tsx
    :29 RouteComponent
           5 cyclomatic    4 cognitive   45 lines
          30.0 CRAP
  apps/web/src/shared/components/ui/calendar.tsx
    :190 CalendarDayButton
           5 cyclomatic    1 cognitive   37 lines
          30.0 CRAP
  apps/web/src/features/organization/components/members/profile/rider/overview/level.tsx
    :46 <arrow>
           5 cyclomatic    2 cognitive    9 lines
          30.0 CRAP
    :22 RiderLevel
           5 cyclomatic    4 cognitive   62 lines
          30.0 CRAP
  apps/web/src/routes/org/$slug/(authenticated)/settings/organization/general/-logo.tsx
:32 onSubmit
5 cyclomatic 5 cognitive 41 lines
30.0 CRAP
apps/web/src/shared/components/form/variants/trainer-select-field.tsx
:134 MultiSelectField
5 cyclomatic 4 cognitive 63 lines
30.0 CRAP
apps/web/src/features/calendar/utils/lesson.ts
:6 groupLessons
5 cyclomatic 8 cognitive 26 lines
30.0 CRAP
apps/web/src/shared/components/ui/sortable.tsx
:132 handleDragEnd
5 cyclomatic 5 cognitive 24 lines
30.0 CRAP
:250 SortableItem
5 cyclomatic 4 cognitive 79 lines
30.0 CRAP
apps/web/src/features/calendar/components/header/index.tsx
:27 CalendarHeader
5 cyclomatic 5 cognitive 92 lines
30.0 CRAP
apps/web/src/features/organization/components/members/list/index.tsx
:21 MemberList
5 cyclomatic 3 cognitive 96 lines
30.0 CRAP
apps/web/src/features/onboarding/lib/member/questionnaire.schema.ts
:71 buildInitialResponses
5 cyclomatic 7 cognitive 24 lines
30.0 CRAP
apps/web/src/features/onboarding/components/wizard.tsx
:25 OnboardingWizard
5 cyclomatic 3 cognitive 90 lines
30.0 CRAP
apps/web/src/features/lessons/components/form/create/booking-calendar.tsx
:154 <arrow>
5 cyclomatic 4 cognitive 25 lines
30.0 CRAP
apps/web/src/features/calendar/utils/multi-day.ts
:53 dayColumnRange
5 cyclomatic 3 cognitive 17 lines
30.0 CRAP
apps/web/src/shared/components/auth/reset-password-form.tsx
:44 onSubmit
5 cyclomatic 5 cognitive 20 lines
30.0 CRAP
apps/web/src/shared/components/form/checkbox-field.tsx
:20 CheckboxField
5 cyclomatic 4 cognitive 39 lines
30.0 CRAP
apps/web/src/routes/org/$slug.tsx
    :33 beforeLoad
           5 cyclomatic    5 cognitive   61 lines
          30.0 CRAP
  apps/web/src/features/calendar/hooks/use-calendar.tsx
    :180 <arrow>
           5 cyclomatic    4 cognitive   12 lines
          30.0 CRAP
    :195 <arrow>
           5 cyclomatic    4 cognitive   12 lines
          30.0 CRAP
  apps/web/src/features/lessons/components/form/create/index.tsx
    :56 createDefaultValues
           5 cyclomatic    4 cognitive   23 lines
          30.0 CRAP
  apps/web/src/shared/components/data-table/index.tsx
    :22 DataTable
           5 cyclomatic    2 cognitive   81 lines
          30.0 CRAP
  apps/web/src/shared/components/ui/sidebar.tsx
    :497 SidebarMenuButton
           5 cyclomatic    4 cognitive   53 lines
          30.0 CRAP
  apps/web/src/shared/components/ui/faceted-filter.tsx
    :19 FacetedFilter
           5 cyclomatic    3 cognitive  114 lines
          30.0 CRAP
  apps/web/src/features/organization/components/questionnaires/question-builder.tsx
    :41 moveQuestion
           5 cyclomatic    4 cognitive   15 lines
          30.0 CRAP
    :128 <arrow>
           5 cyclomatic    4 cognitive   20 lines
          30.0 CRAP
  apps/web/src/shared/components/fragments/input-search.tsx
    :19 InputSearch
           5 cyclomatic    4 cognitive  102 lines
          30.0 CRAP
  apps/web/src/routes/org/$slug/(authenticated)/admin/calendar/index.tsx
:77 RouteComponent
5 cyclomatic 6 cognitive 59 lines
30.0 CRAP
apps/web/src/routes/org/$slug/(authenticated)/portal/calendar/index.tsx
    :90 RouteComponent
           5 cyclomatic    6 cognitive   63 lines
          30.0 CRAP
  apps/web/src/shared/components/layout/page.tsx
    :18 PageHeader
           5 cyclomatic    4 cognitive   49 lines
          30.0 CRAP
  apps/web/src/shared/components/ui/input-otp.tsx
    :41 InputOTPSlot
           5 cyclomatic    4 cognitive   31 lines
          30.0 CRAP
  apps/web/src/shared/lib/config/colors.ts
    :43 getRoleColor
           5 cyclomatic    1 cognitive   14 lines
          30.0 CRAP
  apps/web/src/routes/org/$slug/(authenticated)/settings/organization/kiosk.tsx
:204 KioskSessionForm
5 cyclomatic 2 cognitive 105 lines
30.0 CRAP
apps/web/src/routes/org/$slug/(authenticated)/admin/members/-columns.tsx
    :132 cell
           5 cyclomatic    7 cognitive  103 lines
          30.0 CRAP
  apps/web/src/routes/org/$slug/(authenticated)/index.tsx
:11 beforeLoad
5 cyclomatic 4 cognitive 16 lines
30.0 CRAP
Functions exceeding cyclomatic, cognitive, or CRAP thresholds (https://docs.fallow.tools/explanations/health#complexity-metrics)
To suppress: // fallow-ignore-next-line complexity

● File health scores (350 files)

66.8 apps/web/src/features/lessons/components/form/create/index.tsx
318 LOC 0 fan-in 5 fan-out 100% dead 0.20 density 72.0 risk

68.2 apps/web/src/shared/components/ui/time-picker.tsx
267 LOC 0 fan-in 4 fan-out 100% dead 0.18 density 210.0 risk

68.4 apps/web/src/features/organization/components/members/profile/rider/overview/index.tsx
114 LOC 0 fan-in 7 fan-out 100% dead 0.11 density 182.0 risk

68.6 apps/web/src/features/lessons/components/form/create/booking-calendar.tsx
276 LOC 1 fan-in 5 fan-out 100% dead 0.14 density 132.0 risk

69.4 apps/web/src/features/kiosk/components/lessons/actions.tsx
121 LOC 0 fan-in 3 fan-out 100% dead 0.17 density 182.0 risk

69.5 apps/web/src/shared/components/auth/otp-card.tsx
111 LOC 0 fan-in 6 fan-out 100% dead 0.09 density 12.0 risk

69.8 apps/web/src/features/kiosk/components/acting-banner.tsx
51 LOC 0 fan-in 6 fan-out 100% dead 0.08 density 20.0 risk

70.2 apps/web/src/features/organization/components/members/profile/rider/tabs/lessons.tsx
56 LOC 0 fan-in 2 fan-out 100% dead 0.18 density 56.0 risk

71.1 apps/web/src/features/organization/components/members/profile/rider/overview/boards.tsx
118 LOC 1 fan-in 2 fan-out 100% dead 0.15 density 20.0 risk

71.1 apps/web/src/features/organization/components/members/profile/rider/overview/level.tsx
84 LOC 1 fan-in 2 fan-out 100% dead 0.15 density 30.0 risk

... and 340 more files (--format json for full list)

Composite file quality scores based on complexity, coupling, and dead code. Risk: low <15, moderate 15-30, high >=30. CRAP estimated from export references (85% direct, 40% indirect, 0% untested). Use --coverage for exact scores. https://docs.fallow.tools/explanations/health#file-health-scores

● Hotspots (172 files, since 6 months)

38.7 ▲ apps/web/src/routes/org/$slug/(authenticated)/route.tsx
9 commits 183 churn 0.21 density 1 fan-in ▲ accelerating

36.3 ─ apps/web/src/features/calendar/hooks/use-calendar.tsx
10 commits 551 churn 0.18 density 23 fan-in ─ stable

34.0 ─ apps/web/src/features/calendar/utils/date.ts
7 commits 395 churn 0.24 density 2 fan-in ─ stable

33.8 ▼ apps/web/src/features/lessons/components/modals/new-lesson/scheduling.tsx
6 commits 245 churn 0.28 density 1 fan-in ▼ cooling

31.4 ▲ apps/web/src/routes/org/$slug.tsx
14 commits 438 churn 0.11 density 1 fan-in ▲ accelerating

28.0 ▼ apps/web/src/shared/components/fragments/user-avatar.tsx
6 commits 98 churn 0.23 density 30 fan-in ▼ cooling

28.0 ▼ apps/web/src/features/onboarding/components/steps/questionnaire.tsx
7 commits 388 churn 0.20 density 2 fan-in ▼ cooling

26.8 ▼ apps/web/src/features/calendar/components/header/index.tsx
9 commits 370 churn 0.15 density 1 fan-in ▼ cooling

26.3 ▼ apps/web/src/shared/components/form/select-field.tsx
7 commits 192 churn 0.19 density 1 fan-in ▼ cooling

26.2 ▼ apps/web/src/features/calendar/components/modals/time-block-form.tsx
7 commits 756 churn 0.19 density 2 fan-in ▼ cooling

24.8 ▲ apps/web/src/features/calendar/components/views/week/index.tsx
11 commits 470 churn 0.11 density 1 fan-in ▲ accelerating

24.6 ▲ apps/web/src/routes/\_\_root.tsx
12 commits 291 churn 0.10 density 1 fan-in ▲ accelerating

24.4 ─ apps/web/src/features/calendar/components/views/day/index.tsx
10 commits 453 churn 0.12 density 1 fan-in ─ stable

24.0 ▼ apps/web/src/features/calendar/components/views/fragments/lesson-block.tsx
8 commits 434 churn 0.15 density 3 fan-in ▼ cooling

23.4 ─ apps/web/src/features/lessons/components/modals/new-lesson/index.tsx
6 commits 448 churn 0.19 density 4 fan-in ─ stable

23.3 ▲ apps/web/src/features/lessons/components/form/choices.tsx
6 commits 335 churn 0.20 density 1 fan-in ▲ accelerating

22.4 ▼ apps/web/src/features/organization/components/business-hours/day-row.tsx
8 commits 946 churn 0.14 density 1 fan-in ▼ cooling

22.0 ▼ apps/web/src/features/organization/components/levels/level-badge.tsx
3 commits 42 churn 0.35 density 5 fan-in ▼ cooling

21.8 ▼ apps/web/src/features/calendar/components/modals/event-modal.tsx
4 commits 343 churn 0.27 density 3 fan-in ▼ cooling

21.8 ─ apps/web/src/routes/org/$slug/(authenticated)/admin/index.tsx
12 commits 763 churn 0.09 density 1 fan-in ─ stable

21.4 ─ apps/web/src/routes/org/$slug/(authenticated)/admin/route.tsx
9 commits 87 churn 0.12 density 1 fan-in ─ stable

21.1 ─ apps/web/src/features/calendar/components/header/filters.tsx
5 commits 464 churn 0.21 density 3 fan-in ─ stable

21.0 ▲ apps/web/src/routes/org/$slug/(authenticated)/settings/account/profile/-details.tsx
8 commits 353 churn 0.13 density 1 fan-in ▲ accelerating

20.8 ▼ apps/web/src/features/organization/components/questionnaires/question-builder.tsx
5 commits 330 churn 0.21 density 2 fan-in ▼ cooling

20.7 ▼ apps/web/src/routes/org/$slug/(authenticated)/portal/calendar/index.tsx
8 commits 298 churn 0.13 density 1 fan-in ▼ cooling

20.6 ▼ apps/web/src/routes/org/$slug/(authenticated)/admin/services/$id.edit.tsx
8 commits 398 churn 0.13 density 1 fan-in ▼ cooling

20.6 ▼ apps/web/src/routes/org/$slug/(authenticated)/admin/services/new.tsx
8 commits 407 churn 0.13 density 1 fan-in ▼ cooling

20.1 ▼ apps/web/src/routes/org/$slug/(non-member)/route.tsx
5 commits 169 churn 0.19 density 1 fan-in ▼ cooling

19.4 ▲ apps/web/src/routes/org/$slug/(authenticated)/portal/lessons/create.tsx
5 commits 701 churn 0.19 density 1 fan-in ▲ accelerating

18.8 ▼ apps/web/src/features/lessons/lib/portal-lesson.form.ts
5 commits 102 churn 0.18 density 2 fan-in ▼ cooling

18.7 ▲ apps/web/src/routes/org/$slug/(authenticated)/portal/route.tsx
7 commits 376 churn 0.13 density 1 fan-in ▲ accelerating

18.6 ─ apps/web/src/features/onboarding/components/steps/personal-details.tsx
5 commits 207 churn 0.19 density 3 fan-in ─ stable

18.1 ▲ apps/web/src/features/organization/components/feed/post/index.tsx
4 commits 283 churn 0.22 density 2 fan-in ▲ accelerating

18.0 ─ apps/web/src/routes/org/$slug/(authenticated)/settings/organization/members/-invitations.tsx
8 commits 379 churn 0.11 density 1 fan-in ─ stable

18.0 ▼ apps/web/src/features/lessons/components/modals/new-lesson/riders.tsx
5 commits 94 churn 0.18 density 1 fan-in ▼ cooling

17.3 ▼ apps/web/src/routes/org/$slug/(authenticated)/admin/boards/$id.edit.tsx
8 commits 344 churn 0.11 density 1 fan-in ▼ cooling

17.2 ─ apps/web/src/features/calendar/utils/lesson.ts
5 commits 133 churn 0.17 density 3 fan-in ─ stable

17.1 ▲ apps/web/src/features/calendar/components/views/fragments/hour-cell.tsx
7 commits 238 churn 0.12 density 3 fan-in ▲ accelerating

17.1 ▼ apps/web/src/features/lessons/lib/new-lesson.form.ts
5 commits 166 churn 0.17 density 8 fan-in ▼ cooling

17.0 ▼ apps/web/src/features/organization/components/members/modals/edit-rider.tsx
5 commits 196 churn 0.17 density 2 fan-in ▼ cooling

16.7 ▼ apps/web/src/routes/org/$slug/(authenticated)/admin/members/-columns.tsx
6 commits 270 churn 0.14 density 1 fan-in ▼ cooling

16.2 ▼ apps/web/src/routes/org/$slug/(authenticated)/admin/members/riders/-columns.tsx
5 commits 245 churn 0.16 density 1 fan-in ▼ cooling

15.3 ▼ apps/web/src/shared/hooks/use-mobile.ts
3 commits 50 churn 0.26 density 13 fan-in ▼ cooling

15.2 ▼ apps/web/src/features/organization/components/questionnaires/rule-builder.tsx
4 commits 201 churn 0.19 density 2 fan-in ▼ cooling

15.2 ▼ apps/web/src/features/organization/components/questionnaires/conditions-builder.tsx
4 commits 240 churn 0.19 density 1 fan-in ▼ cooling

15.1 ▼ apps/web/src/features/calendar/components/mobile/day.tsx
6 commits 589 churn 0.12 density 1 fan-in ▼ cooling

14.9 ▼ apps/web/src/features/lessons/components/modals/view-lesson/riders-list.tsx
5 commits 152 churn 0.15 density 1 fan-in ▼ cooling

14.9 ▼ apps/web/src/features/organization/components/members/modals/role-modal.tsx
5 commits 162 churn 0.15 density 3 fan-in ▼ cooling

14.6 ─ apps/web/src/features/lessons/components/modals/new-lesson/details.tsx
4 commits 196 churn 0.18 density 1 fan-in ─ stable

14.6 ─ apps/web/src/features/calendar/components/views/fragments/timeline.tsx
4 commits 91 churn 0.18 density 4 fan-in ─ stable

14.4 ▼ apps/web/src/routes/org/$slug/(authenticated)/admin/calendar/new.tsx
6 commits 159 churn 0.12 density 1 fan-in ▼ cooling

14.3 ▼ apps/web/src/features/organization/lib/board.form.ts
3 commits 70 churn 0.24 density 2 fan-in ▼ cooling

14.0 ─ apps/web/src/routes/(authenticated)/create-organization.tsx
7 commits 628 churn 0.10 density 1 fan-in ─ stable

13.8 ▼ apps/web/src/routes/org/$slug/(authenticated)/admin/services/index.tsx
7 commits 733 churn 0.10 density 1 fan-in ▼ cooling

13.5 ▲ apps/web/src/features/onboarding/components/steps/waiver.tsx
4 commits 130 churn 0.17 density 2 fan-in ▲ accelerating

13.4 ▲ apps/web/src/features/onboarding/components/wizard.tsx
4 commits 188 churn 0.17 density 2 fan-in ▲ accelerating

13.2 ─ apps/web/src/shared/components/form/submit-button.tsx
4 commits 43 churn 0.17 density 1 fan-in ─ stable

13.2 ▼ apps/web/src/features/lessons/components/modals/view-lesson/lesson-details.tsx
6 commits 246 churn 0.11 density 1 fan-in ▼ cooling

13.0 ▲ apps/web/src/routes/org/$slug/(authenticated)/admin/boards/new.tsx
6 commits 201 churn 0.11 density 1 fan-in ▲ accelerating

12.9 ▲ apps/web/src/routes/org/$slug/(authenticated)/portal/index.tsx
8 commits 508 churn 0.08 density 1 fan-in ▲ accelerating

12.7 ─ apps/web/src/routes/org/$slug/(non-member)/onboarding.tsx
4 commits 533 churn 0.15 density 1 fan-in ─ stable

12.5 ▼ apps/web/src/features/organization/components/feed/composer.tsx
3 commits 306 churn 0.21 density 2 fan-in ▼ cooling

12.4 ─ apps/web/src/shared/components/form/text-field.tsx
4 commits 96 churn 0.16 density 1 fan-in ─ stable

12.4 ▼ apps/web/src/routes/org/$slug/(authenticated)/admin/boards/index.tsx
7 commits 373 churn 0.09 density 1 fan-in ▼ cooling

12.2 ─ apps/web/src/features/calendar/components/views/day/column.tsx
5 commits 127 churn 0.12 density 2 fan-in ─ stable

12.1 ─ apps/web/src/features/lessons/components/modals/view-lesson/index.tsx
4 commits 222 churn 0.15 density 5 fan-in ─ stable

12.1 ─ apps/web/src/features/organization/components/guardians/controls-modal.tsx
4 commits 217 churn 0.15 density 1 fan-in ─ stable

11.9 ▼ apps/web/src/features/organization/components/feed/filters.tsx
3 commits 651 churn 0.20 density 2 fan-in ▼ cooling

11.9 ▼ apps/web/src/routes/org/$slug/(authenticated)/admin/members/index.tsx
6 commits 134 churn 0.10 density 1 fan-in ▼ cooling

11.9 ▲ apps/web/src/main.tsx
5 commits 182 churn 0.12 density 2 fan-in ▲ accelerating

11.7 ▼ apps/web/src/routes/auth/callback.tsx
3 commits 122 churn 0.19 density 1 fan-in ▼ cooling

11.6 ▲ apps/web/src/features/lessons/components/modals/view-lesson/portal-actions.tsx
3 commits 178 churn 0.19 density 1 fan-in ▲ accelerating

11.5 ▲ apps/web/src/features/calendar/components/index.tsx
3 commits 31 churn 0.19 density 3 fan-in ▲ accelerating

11.4 ▼ apps/web/src/features/lessons/components/fragments/lesson-card/date-chip.tsx
5 commits 352 churn 0.11 density 2 fan-in ▼ cooling

11.2 ─ apps/web/src/shared/components/layout/user-dropdown.tsx
7 commits 295 churn 0.08 density 2 fan-in ─ stable

11.1 ▲ apps/web/src/shared/components/form/clearable-select-field.tsx
3 commits 124 churn 0.19 density 1 fan-in ▲ accelerating

11.0 ▼ apps/web/src/features/calendar/components/views/agenda/index.tsx
5 commits 142 churn 0.11 density 1 fan-in ▼ cooling

10.9 ▼ apps/web/src/features/onboarding/lib/member/questionnaire.schema.ts
3 commits 179 churn 0.18 density 3 fan-in ▼ cooling

10.9 ─ apps/web/src/routes/org/$slug/(authenticated)/admin/calendar/index.tsx
5 commits 391 churn 0.11 density 1 fan-in ─ stable

10.8 ▼ apps/web/src/features/organization/components/members/profile/rider/tabs/lessons.tsx
3 commits 87 churn 0.18 density 0 fan-in ▼ cooling

10.7 ▼ apps/web/src/features/organization/components/business-hours/tabs.tsx
3 commits 281 churn 0.17 density 2 fan-in ▼ cooling

10.7 ─ apps/web/src/shared/components/layout/page.tsx
6 commits 122 churn 0.09 density 15 fan-in ─ stable

10.6 ─ apps/web/src/routes/org/$slug/(authenticated)/settings/organization/members/-invite.tsx
4 commits 133 churn 0.13 density 1 fan-in ─ stable

10.4 ─ apps/web/src/routeTree.gen.ts
13 commits 7123 churn 0.04 density 1 fan-in ─ stable

10.4 ─ apps/web/src/routes/org/$slug/(authenticated)/settings/organization/general/-logo.tsx
4 commits 277 churn 0.13 density 1 fan-in ─ stable

10.2 ▲ apps/web/src/shared/components/layout/header-search.tsx
3 commits 291 churn 0.17 density 1 fan-in ▲ accelerating

10.1 ▼ apps/web/src/shared/lib/navigation/links.ts
3 commits 73 churn 0.16 density 2 fan-in ▼ cooling

    9.9 ─  apps/web/src/shared/components/form/checkbox-field.tsx
           5 commits     66 churn  0.10 density   1 fan-in  ─ stable

    9.8 ▲  apps/web/src/shared/components/auth/login-form.tsx
           6 commits    430 churn  0.08 density   2 fan-in  ▲ accelerating

    9.7 ─  apps/web/src/features/organization/components/guardians/dependent-profile-modal.tsx
           4 commits    196 churn  0.12 density   1 fan-in  ─ stable

    9.6 ▼  apps/web/src/features/organization/components/levels/modal.tsx
           3 commits    182 churn  0.16 density   2 fan-in  ▼ cooling

    9.6 ▲  apps/web/src/features/calendar/components/views/multi-day/index.tsx
           3 commits    307 churn  0.15 density   1 fan-in  ▲ accelerating

    9.6 ▼  apps/web/src/routes/org/$slug/(authenticated)/admin/members/trainers/-columns.tsx
           4 commits    139 churn  0.12 density   1 fan-in  ▼ cooling

    9.6 ▼  apps/web/src/routes/org/$slug/(authenticated)/settings/organization/business-hours.tsx
           8 commits    729 churn  0.06 density   1 fan-in  ▼ cooling

    9.4 ▼  apps/web/src/features/onboarding/components/modals/add-dependent.tsx
           3 commits    298 churn  0.15 density   1 fan-in  ▼ cooling

    9.4 ─  apps/web/src/routes/(authenticated)/route.tsx
           4 commits     54 churn  0.12 density   1 fan-in  ─ stable

    9.3 ▼  apps/web/src/shared/lib/config/colors.ts
           4 commits    213 churn  0.11 density  10 fan-in  ▼ cooling

    9.2 ▼  apps/web/src/routes/org/$slug/auth/route.tsx
           5 commits     79 churn  0.09 density   1 fan-in  ▼ cooling

    9.2 ─  apps/web/src/routes/org/$slug/auth/login.tsx
           5 commits    100 churn  0.09 density   1 fan-in  ─ stable

    9.0 ▼  apps/web/src/features/organization/components/members/profile/rider/overview/boards.tsx
           3 commits    141 churn  0.15 density   1 fan-in  ▼ cooling

    9.0 ▼  apps/web/src/features/organization/components/members/profile/rider/overview/level.tsx
           3 commits    123 churn  0.15 density   1 fan-in  ▼ cooling

    9.0 ▼  apps/web/src/features/organization/components/waivers/waiver-modal.tsx
           3 commits    172 churn  0.15 density   2 fan-in  ▼ cooling

    8.9 ▼  apps/web/src/shared/components/layout/settings-page.tsx
           5 commits    161 churn  0.09 density   1 fan-in  ▼ cooling

    8.9 ▲  apps/web/src/shared/components/form/color-picker-field.tsx
           3 commits     32 churn  0.15 density   1 fan-in  ▲ accelerating

    8.8 ▼  apps/web/src/features/organization/components/business-hours/form.tsx
           3 commits    231 churn  0.14 density   2 fan-in  ▼ cooling

    8.7 ▼  apps/web/src/features/organization/lib/service.form.ts
           4 commits    130 churn  0.11 density   2 fan-in  ▼ cooling

    8.6 ▼  apps/web/src/features/lessons/components/form/riders.tsx
           3 commits    238 churn  0.15 density   1 fan-in  ▼ cooling

    8.6 ▼  apps/web/src/features/organization/components/members/profile/overview.tsx
           4 commits     82 churn  0.11 density   1 fan-in  ▼ cooling

    8.5 ▲  apps/web/src/shared/components/form/multiselect-field.tsx
           4 commits    132 churn  0.11 density   1 fan-in  ▲ accelerating

    8.3 ▲  apps/web/src/features/onboarding/components/steps/organization-details.tsx
           3 commits    107 churn  0.14 density   1 fan-in  ▲ accelerating

    8.3 ▼  apps/web/src/features/lessons/components/fragments/lesson-card/index.tsx
           4 commits    290 churn  0.10 density   7 fan-in  ▼ cooling

    7.9 ▼  apps/web/src/routes/org/$slug/(authenticated)/kiosk/$sessionId/calendar.tsx
           3 commits    191 churn  0.13 density   1 fan-in  ▼ cooling

    7.9 ▼  apps/web/src/features/kiosk/components/act-as-modal.tsx
           4 commits    151 churn  0.10 density   4 fan-in  ▼ cooling

    7.9 ▼  apps/web/src/routes/org/$slug/(authenticated)/settings/organization/general/-details.tsx
           4 commits    141 churn  0.10 density   1 fan-in  ▼ cooling

    7.7 ▼  apps/web/src/routes/org/$slug/(authenticated)/admin/feed.tsx
           3 commits    307 churn  0.13 density   1 fan-in  ▼ cooling

    7.7 ▲  apps/web/src/features/onboarding/components/steps/organization-setup.tsx
           3 commits    115 churn  0.13 density   1 fan-in  ▲ accelerating

    7.5 ▼  apps/web/src/features/lessons/components/fragments/lesson-card/detail.tsx
           3 commits    331 churn  0.12 density   1 fan-in  ▼ cooling

    7.5 ▼  apps/web/src/features/lessons/components/form/information.tsx
           3 commits    163 churn  0.13 density   1 fan-in  ▼ cooling

    7.4 ▲  apps/web/src/shared/components/auth/register-form.tsx
           4 commits    359 churn  0.09 density   2 fan-in  ▲ accelerating

    7.4 ▼  apps/web/src/routes/(authenticated)/index.tsx
           6 commits    315 churn  0.06 density   1 fan-in  ▼ cooling

    7.3 ▲  apps/web/src/routes/auth/login.tsx
           4 commits     46 churn  0.09 density   1 fan-in  ▲ accelerating

    7.3 ─  apps/web/src/routes/auth/register.tsx
           4 commits    200 churn  0.09 density   1 fan-in  ─ stable

    7.3 ─  apps/web/src/routes/org/$slug/auth/register.tsx
           4 commits     58 churn  0.09 density   1 fan-in  ─ stable

    7.2 ▼  apps/web/src/routes/org/$slug/(authenticated)/settings/organization/questionnaires/new.tsx
           3 commits    188 churn  0.12 density   1 fan-in  ▼ cooling

    7.1 ─  apps/web/src/routes/org/$slug/(authenticated)/settings/account/availability.tsx
           7 commits    792 churn  0.05 density   1 fan-in  ─ stable

    7.1 ▲  apps/web/src/shared/components/form/radio-field.tsx
           4 commits    106 churn  0.09 density   1 fan-in  ▲ accelerating

    6.8 ▼  apps/web/src/features/onboarding/components/steps/account-type.tsx
           3 commits    307 churn  0.11 density   1 fan-in  ▼ cooling

    6.6 ▼  apps/web/src/features/organization/components/members/profile/rider/overview/index.tsx
           3 commits    141 churn  0.11 density   0 fan-in  ▼ cooling

    6.5 ▲  apps/web/src/routes/org/$slug/(authenticated)/settings/account/security/-change-password.tsx
           3 commits    142 churn  0.11 density   1 fan-in  ▲ accelerating

    6.4 ▼  apps/web/src/features/organization/components/activity/enrollment.tsx
           4 commits    110 churn  0.08 density   1 fan-in  ▼ cooling

    6.2 ▼  apps/web/src/routes/org/$slug/(authenticated)/admin/services/$id.index.tsx
           4 commits    244 churn  0.08 density   1 fan-in  ▼ cooling

    6.2 ─  apps/web/src/shared/components/fragments/org-logo.tsx
           5 commits     50 churn  0.06 density   8 fan-in  ─ stable

    6.1 ▲  apps/web/src/routes/org/$slug/(authenticated)/settings/account/guardian.tsx
           5 commits    610 churn  0.06 density   1 fan-in  ▲ accelerating

    6.1 ─  apps/web/src/features/calendar/components/header/date-navigator.tsx
           5 commits    273 churn  0.06 density   1 fan-in  ─ stable

    6.1 ▲  apps/web/src/shared/components/auth/impersonation-banner.tsx
           3 commits     44 churn  0.10 density   2 fan-in  ▲ accelerating

    6.1 ▲  apps/web/src/routes/auth/route.tsx
           3 commits     44 churn  0.10 density   1 fan-in  ▲ accelerating

    5.9 ▼  apps/web/src/routes/org/$slug/(authenticated)/settings/organization/questionnaires/$id.edit.tsx
           3 commits    185 churn  0.10 density   1 fan-in  ▼ cooling

    5.4 ─  apps/web/src/routes/org/$slug/(authenticated)/admin/boards/$id.index.tsx
           4 commits    211 churn  0.07 density   1 fan-in  ─ stable

    5.3 ▼  apps/web/src/features/calendar/components/header/view-switcher.tsx
           3 commits    136 churn  0.09 density   1 fan-in  ▼ cooling

    5.1 ▼  apps/web/src/routes/org/$slug/(authenticated)/admin/members/riders/$riderId.tsx
           5 commits    527 churn  0.05 density   1 fan-in  ▼ cooling

    5.0 ─  apps/web/src/shared/components/ui/avatar.tsx
           5 commits    164 churn  0.05 density  17 fan-in  ─ stable

    5.0 ▲  apps/web/src/routes/org/$slug/(authenticated)/kiosk/$sessionId/route.tsx
           3 commits     56 churn  0.08 density   1 fan-in  ▲ accelerating

    5.0 ▲  apps/web/src/features/onboarding/components/modals/guardian-invitation.tsx
           3 commits    190 churn  0.08 density   2 fan-in  ▲ accelerating

    4.8 ─  apps/web/src/shared/lib/navigation/settings.ts
           5 commits    139 churn  0.05 density   3 fan-in  ─ stable

    4.8 ─  apps/web/src/features/calendar/lib/constants.ts
           4 commits     23 churn  0.06 density   9 fan-in  ─ stable

    4.7 ▼  apps/web/src/routes/org/$slug/(authenticated)/settings/organization/general/-levels.tsx
           3 commits    170 churn  0.08 density   1 fan-in  ▼ cooling

    4.7 ▼  apps/web/src/shared/components/ui/sheet.tsx
           3 commits    147 churn  0.08 density   8 fan-in  ▼ cooling

    4.7 ▼  apps/web/src/routes/org/$slug/(authenticated)/settings/route.tsx
           4 commits     65 churn  0.06 density   1 fan-in  ▼ cooling

    4.7 ▼  apps/web/src/features/calendar/lib/search-params.ts
           3 commits     36 churn  0.08 density   4 fan-in  ▼ cooling

    4.2 ▼  apps/web/src/routes/org/$slug/(authenticated)/settings/organization/general/-socials.tsx
           3 commits    108 churn  0.07 density   1 fan-in  ▼ cooling

    4.1 ▼  apps/web/src/routes/org/$slug/(authenticated)/index.tsx
           3 commits     95 churn  0.07 density   1 fan-in  ▼ cooling

    4.0 ─  apps/web/src/routes/org/$slug/(authenticated)/settings/index.tsx
           4 commits    139 churn  0.05 density   1 fan-in  ─ stable

    4.0 ─  apps/web/src/features/onboarding/lib/member/form.ts
           4 commits    253 churn  0.05 density   5 fan-in  ─ stable

    3.5 ▼  apps/web/src/shared/components/ui/dropdown-menu.tsx
           3 commits    275 churn  0.06 density  24 fan-in  ▼ cooling

    3.1 ─  apps/web/src/features/onboarding/lib/organization/validators.ts
           4 commits    122 churn  0.04 density   3 fan-in  ─ stable

    3.1 ▼  apps/web/src/routes/org/$slug/(authenticated)/settings/organization/waivers/index.tsx
           4 commits    388 churn  0.04 density   1 fan-in  ▼ cooling

    3.1 ▲  apps/web/src/shared/components/ui/scroll-area.tsx
           3 commits     75 churn  0.05 density  13 fan-in  ▲ accelerating

    3.0 ▲  apps/web/src/shared/components/ui/select.tsx
           3 commits    208 churn  0.05 density  12 fan-in  ▲ accelerating

    3.0 ▼  apps/web/src/shared/components/modals.tsx
           5 commits     32 churn  0.03 density   1 fan-in  ▼ cooling

    3.0 ▲  apps/web/src/shared/components/ui/command.tsx
           3 commits    207 churn  0.05 density   6 fan-in  ▲ accelerating

    3.0 ▼  apps/web/src/routes/(authenticated)/join-organization.tsx
           3 commits    103 churn  0.05 density   1 fan-in  ▼ cooling

    2.9 ▼  apps/web/src/shared/components/layout/app-sidebar.tsx
           3 commits     69 churn  0.05 density   1 fan-in  ▼ cooling

    2.8 ─  apps/web/vite.config.ts
           7 commits     62 churn  0.02 density   0 fan-in  ─ stable

    2.5 ▲  apps/web/src/routes/org/$slug/(authenticated)/settings/organization/members/index.tsx
           3 commits     51 churn  0.04 density   3 fan-in  ▲ accelerating

    2.0 ▲  apps/web/src/shared/components/ui/badge.tsx
           5 commits     74 churn  0.02 density  35 fan-in  ▲ accelerating

    2.0 ▼  apps/web/src/features/onboarding/lib/organization/form.ts
           5 commits    144 churn  0.02 density   3 fan-in  ▼ cooling

    1.9 ▲  apps/web/src/shared/components/layout/app-header.tsx
           3 commits    170 churn  0.03 density   1 fan-in  ▲ accelerating

    1.8 ▼  apps/web/src/features/organization/components/members/profile/rider/tabs/activity.tsx
           3 commits     43 churn  0.03 density   0 fan-in  ▼ cooling

    1.8 ▲  apps/web/src/routes/org/$slug/(authenticated)/settings/organization/general/index.tsx
           3 commits     95 churn  0.03 density   4 fan-in  ▲ accelerating

    1.8 ▼  apps/web/src/routes/org/$slug/(authenticated)/settings/organization/questionnaires/index.tsx
           3 commits    174 churn  0.03 density   1 fan-in  ▼ cooling

    1.2 ▲  apps/web/src/shared/components/ui/button.tsx
           3 commits     62 churn  0.02 density  125 fan-in  ▲ accelerating

    1.2 ─  apps/web/src/shared/lib/navigation/app.ts
           6 commits    185 churn  0.01 density   4 fan-in  ─ stable

178 files excluded (< 3 commits)

Files with high churn and high complexity — https://docs.fallow.tools/explanations/health#hotspot-metrics

● Refactoring targets (40)
9 low effort · 30 medium · 1 high
score = quick-win ROI (higher = better) · pri = absolute priority

15.2 pri:30.4 apps/web/src/shared/components/data-table/toolbar/index.tsx
dead code · effort:medium · confidence:high Remove 2 unused exports to reduce surface area (67% dead)

15.1 pri:30.2 apps/web/src/features/calendar/utils/date.ts
dead code · effort:medium · confidence:high Remove 2 unused exports to reduce surface area (50% dead)

13.5 pri:13.5 apps/web/src/shared/components/form/text-field.tsx
circular dependency · effort:low · confidence:high Break import cycle to reduce change cascade risk

13.1 pri:26.1 apps/web/src/shared/lib/search/table.ts
dead code · effort:medium · confidence:high Remove 6 unused exports to reduce surface area (86% dead)

12.9 pri:12.9 apps/web/src/shared/components/form/submit-button.tsx
circular dependency · effort:low · confidence:high Break import cycle to reduce change cascade risk

12.3 pri:24.6 apps/web/src/features/calendar/lib/constants.ts
dead code · effort:medium · confidence:high Remove 5 unused exports to reduce surface area (56% dead)

12.3 pri:24.6 apps/web/src/shared/components/ui/number-field.tsx
dead code · effort:medium · confidence:high Remove 6 unused exports to reduce surface area (100% dead)

12.3 pri:12.3 apps/web/src/shared/components/form/color-picker-field.tsx
circular dependency · effort:low · confidence:high Break import cycle to reduce change cascade risk

11.9 pri:23.8 apps/web/src/shared/lib/navigation/links.ts
dead code · effort:medium · confidence:high Remove 5 unused exports to reduce surface area (71% dead)

11.8 pri:23.6 apps/web/src/features/onboarding/lib/member/questionnaire.schema.ts
dead code · effort:medium · confidence:high Remove 3 unused exports to reduce surface area (60% dead)

... and 30 more targets (--format json for full list)

Prioritized refactoring recommendations based on complexity, churn, and coupling signals — https://docs.fallow.tools/explanations/health#refactoring-targets
