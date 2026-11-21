import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Textarea } from "@/components/ui/textarea";
import { appConfig } from "@/config/index";
import { AppShell } from "@/patterns/app-shell";
import { FormActions, FormSection } from "@/patterns/form";
import { PageHeader } from "@/patterns/page-header";
import { sampleNav } from "../nav";

export default function FormPattern() {
  return (
    <AppShell merchantName={appConfig.merchant_name} items={sampleNav} current="/design/form">
      <PageHeader title="Add a service" description="Services are what customers book and pay for." helpHref="/help" />
      <form className="flex flex-col gap-6">
        <FormSection title="Details" description="Shown to customers on your booking page.">
          <Field>
            <Label htmlFor="name">Service name</Label>
            <Input id="name" name="name" defaultValue="Full groom" required />
          </Field>
          <Field>
            <Label htmlFor="category">Category</Label>
            <NativeSelect id="category" name="category" defaultValue="grooming">
              <option value="grooming">Grooming</option>
              <option value="bath">Bath</option>
              <option value="add-on">Add-on</option>
            </NativeSelect>
          </Field>
          <Field className="md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" aria-describedby="description-help" />
            <FieldDescription id="description-help">One or two sentences is plenty.</FieldDescription>
          </Field>
        </FormSection>
        <FormSection title="Time and price">
          <Field>
            <Label htmlFor="minutes">Length in minutes</Label>
            <Input id="minutes" name="minutes" type="number" inputMode="numeric" defaultValue={90} required />
          </Field>
          <Field>
            <Label htmlFor="price">Price</Label>
            <Input id="price" name="price" inputMode="decimal" defaultValue="" aria-invalid aria-describedby="price-error" required />
            <FieldError id="price-error">Enter a price, like 85.00</FieldError>
          </Field>
        </FormSection>
        <FormActions>
          <Button asChild variant="outline">
            <Link href="/design/list">Cancel</Link>
          </Button>
          <Button type="submit">Save service</Button>
        </FormActions>
      </form>
    </AppShell>
  );
}
