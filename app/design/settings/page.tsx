import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { appConfig } from "@/config/index";
import { AppShell } from "@/patterns/app-shell";
import { FormSection, SettingRow, SettingsGroup } from "@/patterns/form";
import { PageHeader } from "@/patterns/page-header";
import { sampleNav } from "../nav";

export default function SettingsPattern() {
  return (
    <AppShell merchantName={appConfig.merchant_name} items={sampleNav} current="/design/settings">
      <PageHeader title="Settings" description="How your business runs in the app." helpHref="/help" />
      <Tabs defaultValue="business">
        <TabsList>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="booking">Booking</TabsTrigger>
          <TabsTrigger value="reminders">Reminders</TabsTrigger>
        </TabsList>
        <TabsContent value="business" className="flex flex-col gap-6">
          <FormSection title="Business details" footer={<Button type="submit">Save changes</Button>}>
            <Field>
              <Label htmlFor="business-name">Business name</Label>
              <Input id="business-name" defaultValue={appConfig.merchant_name} />
            </Field>
            <Field>
              <Label htmlFor="business-phone">Phone</Label>
              <Input id="business-phone" type="tel" defaultValue="(555) 010-0100" />
            </Field>
          </FormSection>
          <SettingsGroup title="Booking rules" description="Changes apply to new bookings.">
            <SettingRow
              id="online-booking"
              label="Online booking"
              description="Let customers book from your booking page."
              control={<Switch id="online-booking" aria-describedby="online-booking-description" defaultChecked />}
            />
            <SettingRow
              id="deposits"
              label="Take a deposit"
              description="Ask for a deposit when a customer books."
              control={<Switch id="deposits" aria-describedby="deposits-description" />}
            />
          </SettingsGroup>
        </TabsContent>
        <TabsContent value="booking">
          <SettingsGroup title="Booking">
            <SettingRow
              id="same-day"
              label="Same-day booking"
              description="Allow bookings for today."
              control={<Switch id="same-day" aria-describedby="same-day-description" defaultChecked />}
            />
          </SettingsGroup>
        </TabsContent>
        <TabsContent value="reminders">
          <SettingsGroup title="Reminders">
            <SettingRow
              id="email-reminders"
              label="Email reminders"
              description="Send a reminder the day before."
              control={<Switch id="email-reminders" aria-describedby="email-reminders-description" defaultChecked />}
            />
          </SettingsGroup>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
