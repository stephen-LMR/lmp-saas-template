import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { theme } from "@/config/index";
import { DialogDemo, MenuDemo } from "./demos";

const PATTERNS = [
  ["dashboard", "Dashboard"], ["list", "List and detail"], ["calendar", "Calendar"], ["form", "Form"],
  ["settings", "Settings"], ["booking", "Public booking page"], ["portal", "Customer portal"], ["states", "Empty, loading, error"]
] as const;

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

export default function DesignSystemPage() {
  return (
    <main className="mx-auto flex max-w-content flex-col gap-8 p-4 md:p-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold">Design system</h1>
        <p className="text-muted-foreground">Theme: {theme.preset_id}, {theme.font_pairing_id} fonts, {theme.mode} mode.</p>
      </header>

      <Section title="Page patterns">
        <ul className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {PATTERNS.map(([slug, label]) => (
            <li key={slug}>
              <Button asChild variant="outline" className="w-full">
                <Link href={`/design/${slug}`}>{label}</Link>
              </Button>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Type">
        <div className="flex flex-col gap-2">
          <p className="font-heading text-2xl font-semibold">Heading 2xl</p>
          <p className="font-heading text-xl font-semibold">Heading xl</p>
          <p className="font-heading text-lg font-semibold">Heading lg</p>
          <p className="text-base">Body text at base size.</p>
          <p className="text-sm text-muted-foreground">Small muted text.</p>
          <p className="text-xs text-muted-foreground">Extra small text.</p>
        </div>
      </Section>

      <Section title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Delete</Button>
          <Button variant="link">Link</Button>
          <Button disabled>Disabled</Button>
          <Button size="sm" variant="outline">Small</Button>
          <Button size="lg" variant="outline">Large</Button>
        </div>
      </Section>

      <Section title="Badges">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="default">Primary</Badge>
          <Badge>Secondary</Badge>
          <Badge variant="accent">Accent</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="danger">Danger</Badge>
          <Badge variant="outline">Outline</Badge>
        </div>
      </Section>

      <Section title="Form controls">
        <Card>
          <CardContent className="grid gap-4 pt-4 md:grid-cols-2 md:pt-6">
            <Field>
              <Label htmlFor="g-text">Text</Label>
              <Input id="g-text" placeholder="Placeholder" />
            </Field>
            <Field>
              <Label htmlFor="g-invalid">With an error</Label>
              <Input id="g-invalid" aria-invalid aria-describedby="g-invalid-error" defaultValue="abc" />
              <FieldError id="g-invalid-error">Enter a valid email</FieldError>
            </Field>
            <Field>
              <Label htmlFor="g-select">Select</Label>
              <NativeSelect id="g-select" defaultValue="b">
                <option value="a">First</option>
                <option value="b">Second</option>
              </NativeSelect>
            </Field>
            <Field>
              <Label htmlFor="g-disabled">Disabled</Label>
              <Input id="g-disabled" disabled defaultValue="Cannot change" />
            </Field>
            <Field className="md:col-span-2">
              <Label htmlFor="g-textarea">Text area</Label>
              <Textarea id="g-textarea" rows={3} />
            </Field>
            <div className="flex items-center gap-3">
              <Checkbox id="g-check" defaultChecked />
              <Label htmlFor="g-check">Checkbox</Label>
            </div>
            <div className="flex items-center gap-3">
              <Switch id="g-switch" defaultChecked />
              <Label htmlFor="g-switch">Switch</Label>
            </div>
          </CardContent>
        </Card>
      </Section>

      <Section title="Alerts">
        <div className="grid gap-3 md:grid-cols-2">
          <Alert><AlertTitle>Heads up</AlertTitle><AlertDescription>Something worth knowing.</AlertDescription></Alert>
          <Alert variant="success"><AlertTitle>Saved</AlertTitle><AlertDescription>Your changes are live.</AlertDescription></Alert>
          <Alert variant="warning"><AlertTitle>Check this</AlertTitle><AlertDescription>Two bookings overlap.</AlertDescription></Alert>
          <Alert variant="danger"><AlertTitle>Payment failed</AlertTitle><AlertDescription>The card was declined.</AlertDescription></Alert>
        </div>
      </Section>

      <Section title="Cards and more">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Card title</CardTitle>
              <CardDescription>A short description.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Avatar><AvatarFallback>MA</AvatarFallback></Avatar>
                <span className="font-medium">Maria Alvarez</span>
              </div>
              <Separator />
              <div className="flex flex-col gap-2">
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Overlays</CardTitle>
              <CardDescription>Dialog and menu.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <DialogDemo />
              <MenuDemo />
            </CardContent>
          </Card>
        </div>
      </Section>
    </main>
  );
}
