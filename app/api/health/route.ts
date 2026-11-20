import { appConfig } from "@/config/index";

export function GET() {
  return Response.json({
    ok: true,
    project_id: appConfig.project_id,
    template_version: appConfig.template_version
  });
}
