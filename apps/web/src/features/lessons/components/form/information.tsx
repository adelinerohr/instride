import { PencilIcon, XIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
} from "@/shared/components/ui/collapsible";
import { FieldGroup } from "@/shared/components/ui/field";
import {
  InputGroupAddon,
  InputGroupButton,
  InputGroupText,
} from "@/shared/components/ui/input-group";
import { Separator } from "@/shared/components/ui/separator";
import { withForm } from "@/shared/hooks/form";

import { lessonFormOpts } from "../../lib/new-lesson.form";

export const LessonInformationFormSection = withForm({
  ...lessonFormOpts,
  props: {
    // Unlocked once step one is complete; opens automatically when first unlocked
    isUnlocked: false as boolean,
    canProceed: false as boolean,
  },
  render: ({ form, isUnlocked, canProceed }) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [addNotes, setAddNotes] = React.useState(false);

    // Auto-open once the previous step is completed for the first time
    const wasUnlocked = React.useRef(false);

    React.useEffect(() => {
      if (isUnlocked && !wasUnlocked.current) {
        wasUnlocked.current = true;
        setIsOpen(true);
      }
    }, [isUnlocked]);

    const handleToggleNotes = () => {
      if (addNotes) {
        form.setFieldValue("notes", "");
        setAddNotes(false);
      } else {
        setAddNotes(true);
      }
    };

    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <Card
          className={!isUnlocked ? "opacity-60 pointer-events-none" : undefined}
        >
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Provide basic information about the lesson.
            </CardDescription>
            {!isOpen && isUnlocked && (
              <CardAction>
                <Button onClick={() => setIsOpen(true)}>
                  Edit
                  <PencilIcon />
                </Button>
              </CardAction>
            )}
            {isOpen && canProceed && (
              <CardAction>
                <Button variant="ghost" onClick={() => setIsOpen(false)}>
                  Close
                  <XIcon />
                </Button>
              </CardAction>
            )}
          </CardHeader>
          <CollapsibleContent className="space-y-4">
            <CardContent>
              <FieldGroup>
                <div className="grid grid-cols-1 md:grid-cols-[1fr_0.4fr_0.2fr] gap-4">
                  <form.AppField
                    name="start"
                    children={(field) => (
                      <field.DatetimeField label="Date and time" />
                    )}
                  />
                  <form.AppField
                    name="duration"
                    children={(field) => (
                      <field.TextField label="Duration" type="number" step={15}>
                        <InputGroupAddon align="inline-end">
                          <InputGroupText>minutes</InputGroupText>
                        </InputGroupAddon>
                      </field.TextField>
                    )}
                  />
                  <form.AppField
                    name="isRecurring"
                    children={(field) => (
                      <field.SwitchField label="Recurring?" />
                    )}
                  />
                </div>
                <form.AppField
                  name="name"
                  children={(field) => (
                    <field.TextField
                      label="Name"
                      placeholder="e.g. Beginner's Lesson"
                    >
                      <InputGroupAddon align="inline-end">
                        <InputGroupButton
                          variant="secondary"
                          onClick={handleToggleNotes}
                        >
                          {addNotes ? "Clear Notes" : "Add Notes"}
                        </InputGroupButton>
                      </InputGroupAddon>
                    </field.TextField>
                  )}
                />
                {addNotes && (
                  <form.AppField
                    name="notes"
                    children={(field) => (
                      <field.TextareaField
                        label="Notes"
                        placeholder="Enter any additional notes about the lesson"
                      />
                    )}
                  />
                )}
              </FieldGroup>
            </CardContent>
            <Separator />
            <CardFooter>
              <Button
                onClick={() => setIsOpen(false)}
                disabled={!canProceed}
                className="ml-auto"
              >
                Next
              </Button>
            </CardFooter>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    );
  },
});
