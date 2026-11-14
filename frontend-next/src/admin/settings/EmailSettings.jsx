import { useState } from "react";
import { AlertTriangle, CheckCircle2, RefreshCw, Send } from "lucide-react";
import { Badge, Button, Card, Field, IconButton, Input, Skeleton } from "../ui";
import {
  useEmailStatus,
  useSendTestEmail,
  useVerifyEmailTransport,
} from "../../hooks/useCms";
import { useToast } from "../../context/ToastContext";

const EnvRow = ({ label, value, ok }) => (
  <div className="flex items-center justify-between gap-3 py-2.5">
    <dt className="font-mono text-[13px] text-subtle">{label}</dt>
    <dd className="min-w-0 text-right">
      {ok ? (
        <span className="break-all text-sm font-medium text-navy-900">{value}</span>
      ) : (
        <Badge tone="danger">{value}</Badge>
      )}
    </dd>
  </div>
);

const EmailSettings = () => {
  const toast = useToast();
  const [recipient, setRecipient] = useState("");
  const { data: status, isLoading, refetch, isFetching } = useEmailStatus();
  const verifyEmail = useVerifyEmailTransport();
  const sendTestEmail = useSendTestEmail();

  const handleVerify = () => {
    verifyEmail.mutate(undefined, {
      onSuccess: () => toast.success("SMTP verified", "Production can connect to the configured mail server."),
      onError: (error) =>
        toast.error("SMTP failed", error?.response?.data?.message || error?.message || "Could not verify SMTP."),
    });
  };

  const handleSendTest = () => {
    sendTestEmail.mutate(
      { to: recipient.trim() || undefined },
      {
        onSuccess: (result) => toast.success("Test email sent", result?.message || "Check the inbox."),
        onError: (error) =>
          toast.error("Test failed", error?.response?.data?.message || error?.message || "Could not send test email."),
      },
    );
  };

  if (isLoading) {
    return (
      <Card>
        <div aria-busy="true" aria-label="Loading email setup" className="space-y-3">
          <Skeleton className="w-1/3" />
          <Skeleton className="w-2/3" />
          <Skeleton className="w-1/2" />
        </div>
      </Card>
    );
  }

  const configured = Boolean(status?.configured);

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
      <Card
        title={configured ? "Email variables are present" : "Email variables are incomplete"}
        description="Read from the running backend environment, so this reflects production after redeploy. Secrets stay hidden; only presence is shown."
        actions={
          <>
            <Badge tone={configured ? "success" : "danger"}>
              {configured ? <CheckCircle2 size={13} aria-hidden="true" /> : <AlertTriangle size={13} aria-hidden="true" />}
              {configured ? "Configured" : "Missing"}
            </Badge>
            <IconButton
              label="Refresh SMTP status"
              icon={RefreshCw}
              variant="secondary"
              size="sm"
              iconSize={15}
              onClick={() => refetch()}
              disabled={isFetching}
              className={isFetching ? "[&_svg]:animate-spin" : undefined}
            />
          </>
        }
      >
        <dl className="divide-y divide-line">
          <EnvRow label="SMTP_HOST" value={status?.hostSet ? "Set" : "Missing"} ok={status?.hostSet} />
          <EnvRow label="SMTP_PORT" value={status?.port || "Missing"} ok={Boolean(status?.port)} />
          <EnvRow label="SMTP_SECURE" value={String(Boolean(status?.secure))} ok />
          <EnvRow label="SMTP_USER" value={status?.user || "Missing"} ok={status?.userSet} />
          <EnvRow label="SMTP_PASS" value={status?.passSet ? "Set" : "Missing"} ok={status?.passSet} />
          <EnvRow label="EMAIL_FROM" value={status?.from || "Missing"} ok={status?.fromSet} />
        </dl>
      </Card>

      <Card title="Live test" description="Verify the connection, then send a real message.">
        <div className="space-y-4">
          <Button
            variant="secondary"
            icon={CheckCircle2}
            loading={verifyEmail.isPending}
            onClick={handleVerify}
            className="w-full"
          >
            {verifyEmail.isPending ? "Verifying…" : "Verify SMTP"}
          </Button>

          <Field label="Test recipient" hint="Leave blank to use the admin email.">
            <Input
              type="email"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="name@example.com"
            />
          </Field>

          <Button
            variant="primary"
            icon={Send}
            loading={sendTestEmail.isPending}
            onClick={handleSendTest}
            className="w-full"
          >
            {sendTestEmail.isPending ? "Sending…" : "Send test email"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default EmailSettings;
