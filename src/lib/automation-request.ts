import { timingSafeEqual } from "node:crypto";

export function scheduledRequestIsAuthorized(request: Request) {
  const authorization = request.headers.get("authorization")?.trim() ?? "";
  const bearer = /^Bearer\s+(.+)$/i.exec(authorization)?.[1]?.trim() ?? "";
  const supplied =
    request.headers.get("x-morrow-automation-key")?.trim() ||
    request.headers.get("x-devonos-automation-key")?.trim() ||
    bearer;
  if (!supplied) return false;

  const suppliedBytes = Buffer.from(supplied);
  return [
    process.env.MORROW_AUTOMATION_SECRET,
    process.env.DEVONOS_AUTOMATION_SECRET,
    process.env.CRON_SECRET,
  ].some((value) => {
    const secret = value?.trim();
    if (!secret) return false;
    const secretBytes = Buffer.from(secret);
    return (
      secretBytes.length === suppliedBytes.length &&
      timingSafeEqual(secretBytes, suppliedBytes)
    );
  });
}
