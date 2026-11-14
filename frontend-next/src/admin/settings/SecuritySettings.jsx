import { ShieldCheck } from "lucide-react";
import { Card, EmptyState } from "../ui";

/**
 * Placeholder until real security controls exist. The previous version showed a
 * fabricated "Auto-Backup Active / AWS S3" status and buttons with no handlers.
 */
const SecuritySettings = () => (
  <Card>
    <EmptyState
      icon={ShieldCheck}
      title="No security controls yet"
      description="Security controls such as database backups, cache clearing and session or password resets are not available from the admin yet."
    />
  </Card>
);

export default SecuritySettings;
