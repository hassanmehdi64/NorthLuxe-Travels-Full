import { useEffect, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, PencilLine, Plus, Trash2, X } from "lucide-react";
import {
  Badge,
  Button,
  Card,
  Checkbox,
  EmptyState,
  Field,
  IconButton,
  Input,
  RowActions,
  Select,
  StatusBadge,
  Switch,
  TabPanel,
  Tabs,
  Textarea,
  useConfirm,
} from "../ui";
import {
  SUPPORTED_PAYMENT_METHODS,
  ensurePaymentConfig,
} from "../../components/booking/paymentConfig";

const ensurePricingShape = (settings) => {
  const bookingPricing = settings.bookingPricing || {};
  return {
    dailyBaseFee: bookingPricing.dailyBaseFee ?? 0,
    perGuestDailyFee: bookingPricing.perGuestDailyFee ?? 0,
    mealsDailyRate: bookingPricing.mealsDailyRate ?? 0,
    insuranceRate: bookingPricing.insuranceRate ?? 0,
    airportTransferRate: bookingPricing.airportTransferRate ?? 0,
    transportNote: bookingPricing.transportNote ?? "",
    hotelCategories: Array.isArray(bookingPricing.hotelCategories)
      ? bookingPricing.hotelCategories
      : [],
    vehicleTypes: Array.isArray(bookingPricing.vehicleTypes)
      ? bookingPricing.vehicleTypes
      : [],
  };
};

const numberInput = (value) => Number(value || 0);

const getManualMethodLinkState = (paymentConfig, method) => {
  if (method.mode !== "manual") {
    return { status: "not_required", account: null };
  }

  if (!method.accountKey) {
    return { status: "missing", account: null };
  }

  const matchedAccount = paymentConfig.accounts.find((item) => item.key === method.accountKey) || null;
  if (!matchedAccount) {
    return { status: "missing", account: null };
  }

  if (matchedAccount.active === false) {
    return { status: "inactive", account: matchedAccount };
  }

  return { status: "active", account: matchedAccount };
};

const createEmptyAccount = (index) => ({
  key: `account_${index + 1}`,
  label: `Account ${index + 1}`,
  accountTitle: "",
  accountNumber: "",
  bankName: "",
  contactNumber: "",
  iban: "",
  branchCode: "",
  swiftCode: "",
  beneficiaryAddress: "",
  instructions: "",
  active: true,
});

const getAccountCompletion = (account) => {
  const trackedFields = [
    account.label,
    account.accountTitle,
    account.accountNumber,
    account.bankName,
    account.contactNumber,
    account.branchCode,
    account.iban,
    account.instructions,
  ];

  return {
    completed: trackedFields.filter((value) => String(value || "").trim()).length,
    total: trackedFields.length,
  };
};

const SETTINGS_TABS = [
  { key: "methods", label: "Payments" },
  { key: "pricing", label: "Pricing" },
  { key: "hotels", label: "Hotels" },
  { key: "vehicles", label: "Vehicles" },
];

const ACCOUNT_DETAIL_TABS = [
  { key: "basic", label: "Basic" },
  { key: "extra", label: "Extra" },
  { key: "notes", label: "Notes" },
];

const SECTION_META = {
  methods: {
    title: "Payments",
    text: "Manage payment methods and receiving accounts.",
  },
  pricing: {
    title: "Pricing",
    text: "Update booking charges and core rate values.",
  },
  hotels: {
    title: "Hotels",
    text: "Edit hotel categories and their daily rates.",
  },
  vehicles: {
    title: "Vehicles",
    text: "Edit vehicle types and their daily rates.",
  },
};

/** Editable rows for hotel categories / vehicle types (key, label, daily rate, active). */
const OptionsTable = ({ title, description, noun, items, onAdd, onChange, onRemove }) => (
  <Card
    flush
    className="overflow-hidden"
    title={title}
    description={description}
    actions={<Button size="sm" variant="secondary" icon={Plus} onClick={onAdd}>Add {noun}</Button>}
  >
    {items.length ? (
      <div className="admin-table-wrap border-t border-line">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Key</th>
              <th>Label</th>
              <th className="w-40">Daily rate</th>
              <th className="w-28">Status</th>
              <th className="w-12"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={`${item.key}-${index}`}>
                <td>
                  <Input aria-label={`${noun} ${index + 1} key`} value={item.key} onChange={(e) => onChange(index, { key: e.target.value })} />
                </td>
                <td>
                  <Input aria-label={`${noun} ${index + 1} label`} value={item.label} onChange={(e) => onChange(index, { label: e.target.value })} />
                </td>
                <td>
                  <Input
                    type="number"
                    aria-label={`${noun} ${index + 1} daily rate`}
                    value={item.dailyRate}
                    onChange={(e) => onChange(index, { dailyRate: numberInput(e.target.value) })}
                  />
                </td>
                <td>
                  <Checkbox
                    label="Active"
                    checked={item.active !== false}
                    onChange={(e) => onChange(index, { active: e.target.checked })}
                  />
                </td>
                <td>
                  <IconButton
                    label={`Remove ${item.label || noun}`}
                    icon={Trash2}
                    variant="danger"
                    size="sm"
                    iconSize={16}
                    onClick={() => onRemove(index)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ) : (
      <EmptyState
        className="border-t border-line"
        title={`No ${noun} options yet`}
        description={`Add a ${noun} option so customers can choose it when booking.`}
        action={<Button size="sm" variant="secondary" icon={Plus} onClick={onAdd}>Add {noun}</Button>}
      />
    )}
  </Card>
);

const BookingPricingSettings = ({ settings, setSettings }) => {
  const pricing = ensurePricingShape(settings);
  const paymentConfig = ensurePaymentConfig(settings);
  const activeMethods = paymentConfig.methods.filter((item) => item.active !== false);
  const activeAccounts = paymentConfig.accounts.filter((item) => item.active !== false);
  const linkedManualMethods = activeMethods.filter(
    (item) => getManualMethodLinkState(paymentConfig, item).status === "active",
  );
  const unlinkedManualMethods = activeMethods.filter(
    (item) => item.mode === "manual" && getManualMethodLinkState(paymentConfig, item).status !== "active",
  );

  const confirm = useConfirm();
  const [activeSettingsTab, setActiveSettingsTab] = useState("methods");
  const [selectedMethodKey, setSelectedMethodKey] = useState("");
  const [selectedAccountKey, setSelectedAccountKey] = useState("");
  const [activeAccountTab, setActiveAccountTab] = useState("basic");
  const [isMethodEditorOpen, setIsMethodEditorOpen] = useState(false);
  const [isAccountEditorOpen, setIsAccountEditorOpen] = useState(false);
  const methodEditorRef = useRef(null);
  const accountEditorRef = useRef(null);

  useEffect(() => {
    if (!paymentConfig.methods.length) {
      if (selectedMethodKey) setSelectedMethodKey("");
      return;
    }

    if (!paymentConfig.methods.some((item) => item.key === selectedMethodKey)) {
      setSelectedMethodKey(paymentConfig.methods[0].key);
    }
  }, [paymentConfig.methods, selectedMethodKey]);

  useEffect(() => {
    if (!paymentConfig.accounts.length) {
      if (selectedAccountKey) setSelectedAccountKey("");
      return;
    }

    if (!paymentConfig.accounts.some((item) => item.key === selectedAccountKey)) {
      setSelectedAccountKey(paymentConfig.accounts[0].key);
    }
  }, [paymentConfig.accounts, selectedAccountKey]);

  useEffect(() => {
    setActiveAccountTab("basic");
  }, [selectedAccountKey, isAccountEditorOpen]);

  useEffect(() => {
    if (!selectedMethodKey || !isMethodEditorOpen || !methodEditorRef.current) return;
    methodEditorRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [selectedMethodKey, isMethodEditorOpen]);

  useEffect(() => {
    if (!selectedAccountKey || !isAccountEditorOpen || !accountEditorRef.current) return;
    accountEditorRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [selectedAccountKey, isAccountEditorOpen]);

  const selectedAccountIndex = paymentConfig.accounts.findIndex((item) => item.key === selectedAccountKey);
  const selectedAccount = selectedAccountIndex >= 0 ? paymentConfig.accounts[selectedAccountIndex] : null;
  const selectedAccountLinkedMethods = selectedAccount
    ? paymentConfig.methods.filter((item) => item.accountKey === selectedAccount.key)
    : [];
  const selectedAccountCompletion = selectedAccount
    ? getAccountCompletion(selectedAccount)
    : { completed: 0, total: 0 };
  const selectedMethod = paymentConfig.methods.find((item) => item.key === selectedMethodKey) || null;
  const selectedMethodLinkState = selectedMethod
    ? getManualMethodLinkState(paymentConfig, selectedMethod)
    : { status: "not_required", account: null };

  const setPricingState = (updater) =>
    setSettings((prev) => {
      const currentPricing = ensurePricingShape(prev);
      return {
        ...prev,
        bookingPricing: updater(currentPricing),
      };
    });

  const updatePricing = (next) =>
    setPricingState((current) => ({
      ...current,
      ...next,
    }));

  const setPaymentConfigState = (updater) =>
    setSettings((prev) => {
      const currentPaymentConfig = ensurePaymentConfig(prev);
      return {
        ...prev,
        paymentConfig: updater(currentPaymentConfig),
      };
    });

  const updatePaymentConfig = (next) =>
    setPaymentConfigState((current) => ({
      ...current,
      ...next,
    }));

  const updateOption = (key, index, patch) =>
    setPricingState((current) => {
      const list = [...current[key]];
      list[index] = { ...list[index], ...patch };
      return {
        ...current,
        [key]: list,
      };
    });

  const addOption = (key, labelPrefix) =>
    setPricingState((current) => {
      const list = [...current[key]];
      list.push({
        key: `${labelPrefix}_${list.length + 1}`,
        label: `${labelPrefix} ${list.length + 1}`,
        dailyRate: 0,
        active: true,
      });
      return {
        ...current,
        [key]: list,
      };
    });

  const removeOption = (key, index) =>
    setPricingState((current) => {
      const list = [...current[key]];
      list.splice(index, 1);
      return {
        ...current,
        [key]: list,
      };
    });

  const updateMethod = (methodKey, patch) =>
    setPaymentConfigState((current) => ({
      ...current,
      methods: current.methods.map((item) =>
        item.key === methodKey ? { ...item, ...patch } : item,
      ),
    }));

  const updateAccount = (index, patch) =>
    setPaymentConfigState((current) => {
      const accounts = [...current.accounts];
      const currentAccount = accounts[index];
      if (!currentAccount) return current;

      const previousKey = currentAccount.key;
      const nextAccount = { ...currentAccount, ...patch };
      accounts[index] = nextAccount;

      const methods =
        patch.key !== undefined && previousKey !== nextAccount.key
          ? current.methods.map((item) =>
              item.accountKey === previousKey
                ? { ...item, accountKey: nextAccount.key }
                : item,
            )
          : current.methods;

      return {
        ...current,
        accounts,
        methods,
      };
    });
  const addAccount = () => {
    const nextKey = `account_${paymentConfig.accounts.length + 1}`;
    setPaymentConfigState((current) => ({
      ...current,
      accounts: [...current.accounts, createEmptyAccount(current.accounts.length)],
    }));
    setSelectedAccountKey(nextKey);
    setIsAccountEditorOpen(true);
    setActiveSettingsTab("methods");
  };

  const openMethodEditor = (methodKey) => {
    setSelectedMethodKey(methodKey);
    setIsMethodEditorOpen(true);
  };

  const openAccountEditor = (accountKey) => {
    setSelectedAccountKey(accountKey);
    setIsAccountEditorOpen(true);
  };
  const removeAccount = (index) => {
    const nextAccounts = paymentConfig.accounts.filter((_, itemIndex) => itemIndex !== index);
    const nextSelectedKey = nextAccounts[index]?.key || nextAccounts[index - 1]?.key || "";

    setPaymentConfigState((current) => {
      const accounts = [...current.accounts];
      const [removedAccount] = accounts.splice(index, 1);
      const methods = removedAccount?.key
        ? current.methods.map((item) =>
            item.accountKey === removedAccount.key ? { ...item, accountKey: "" } : item,
          )
        : current.methods;

      return {
        ...current,
        accounts,
        methods,
      };
    });

    setSelectedAccountKey(nextSelectedKey);
    setIsAccountEditorOpen(Boolean(nextSelectedKey));
  };

  const confirmRemoveOption = async (key, index, noun) => {
    const item = pricing[key][index];
    const ok = await confirm({
      title: `Remove ${noun}?`,
      description: `"${item?.label || item?.key || noun}" will be removed when you save changes.`,
      confirmLabel: `Remove ${noun}`,
      cancelLabel: "Keep it",
    });
    if (ok) removeOption(key, index);
  };

  const confirmRemoveAccount = async (index) => {
    const account = paymentConfig.accounts[index];
    const ok = await confirm({
      title: "Remove payment details?",
      description: `"${account?.label || "These details"}" will be removed and unlinked from any payment method when you save changes.`,
      confirmLabel: "Remove details",
      cancelLabel: "Keep details",
    });
    if (ok) removeAccount(index);
  };

  const subTabs = SETTINGS_TABS.map((tab) => ({
    value: tab.key,
    label: SECTION_META[tab.key]?.title || tab.label,
    count:
      tab.key === "hotels"
        ? pricing.hotelCategories.length
        : tab.key === "vehicles"
          ? pricing.vehicleTypes.length
          : undefined,
  }));

  return (
    <div className="space-y-5">
      <div
        role="status"
        className={`flex flex-col gap-2 rounded-card border px-4 py-3 text-[13px] sm:flex-row sm:items-center sm:justify-between ${
          unlinkedManualMethods.length
            ? "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300"
            : "border-line bg-surface text-body"
        }`}
      >
        <div className="flex items-start gap-2">
          {unlinkedManualMethods.length ? (
            <AlertTriangle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          ) : (
            <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-brand-700" aria-hidden="true" />
          )}
          <div>
            <p className="font-medium">
              {unlinkedManualMethods.length
                ? "Some manual payment methods still need an active account."
                : "All active manual payment methods are connected to an active account."}
            </p>
            {unlinkedManualMethods.length ? (
              <p className="mt-0.5">
                {unlinkedManualMethods
                  .map((item) => {
                    const linkState = getManualMethodLinkState(paymentConfig, item);
                    return `${item.label} (${linkState.status === "inactive" ? "inactive account" : "not linked"})`;
                  })
                  .join(", ")}
              </p>
            ) : null}
          </div>
        </div>
        <p className="shrink-0 text-subtle">
          {activeMethods.length} active methods · {activeAccounts.length} active accounts · {linkedManualMethods.length} linked
        </p>
      </div>

      <Tabs value={activeSettingsTab} onValueChange={setActiveSettingsTab} items={subTabs} ariaLabel="Payments and pricing sections">
        <TabPanel value="methods" className="space-y-5">
          <Card title="Payment rules" description="How customer payments are verified.">
            <div className="space-y-4">
              <Switch
                id="allow-manual-verification"
                checked={paymentConfig.allowManualVerification !== false}
                onCheckedChange={(value) => updatePaymentConfig({ allowManualVerification: value })}
                label="Allow manual payment verification"
              />
              <Switch
                id="require-verified-card"
                checked={paymentConfig.requireVerifiedPaymentForCard !== false}
                onCheckedChange={(value) => updatePaymentConfig({ requireVerifiedPaymentForCard: value })}
                label="Require verified card payment before booking confirmation"
              />
            </div>
          </Card>

          <Card flush className="overflow-hidden" title="Payment methods" description="Methods customers can choose at checkout.">
            <div className="admin-table-wrap border-t border-line">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Method</th>
                    <th>Type</th>
                    <th>Setup</th>
                    <th>Status</th>
                    <th className="w-12"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody>
                  {paymentConfig.methods.map((method) => {
                    const linkState = getManualMethodLinkState(paymentConfig, method);
                    const typeLabel = method.mode === "card" ? "Debit card" : method.mode === "arrival" ? "Arrival" : "Manual transfer";
                    const setupLabel = method.mode === "manual"
                      ? linkState.status === "active"
                        ? linkState.account?.label || "Linked account"
                        : linkState.status === "inactive"
                          ? "Inactive account"
                          : "No linked account"
                      : method.mode === "card"
                        ? "Stripe"
                        : "No account needed";
                    const setupProblem = method.mode === "manual" && linkState.status !== "active";

                    return (
                      <tr key={method.key}>
                        <td>
                          <p className="cell-primary">{method.label}</p>
                          <p className="mt-0.5 text-xs text-subtle">{method.referenceLabel || method.instructions || "No extra note"}</p>
                        </td>
                        <td>{typeLabel}</td>
                        <td>{setupProblem ? <Badge tone="warning">{setupLabel}</Badge> : setupLabel}</td>
                        <td><StatusBadge status={method.active !== false ? "active" : "inactive"} /></td>
                        <td>
                          <RowActions actions={[{ label: `Edit ${method.label}`, icon: PencilLine, onClick: () => openMethodEditor(method.key) }]} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {selectedMethod && isMethodEditorOpen ? (
            <div ref={methodEditorRef} className="scroll-mt-4">
              <Card
                title={`Edit ${selectedMethod.label || "method"}`}
                description="Changes apply after you save."
                actions={<Button size="sm" variant="ghost" icon={X} onClick={() => setIsMethodEditorOpen(false)}>Close</Button>}
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Display label" className="md:col-span-2">
                    <Input
                      value={selectedMethod.label}
                      onChange={(e) => updateMethod(selectedMethod.key, { label: e.target.value })}
                    />
                  </Field>

                  {selectedMethod.mode === "manual" ? (
                    <>
                      <Field label="Account">
                        <Select
                          value={selectedMethod.accountKey || ""}
                          onChange={(e) => updateMethod(selectedMethod.key, { accountKey: e.target.value })}
                        >
                          <option value="">No linked account</option>
                          {paymentConfig.accounts.map((account) => (
                            <option key={account.key} value={account.key}>
                              {account.label}{account.active === false ? " (inactive)" : ""}
                            </option>
                          ))}
                        </Select>
                      </Field>

                      <Field label="Reference label">
                        <Input
                          value={selectedMethod.referenceLabel || ""}
                          onChange={(e) => updateMethod(selectedMethod.key, { referenceLabel: e.target.value })}
                        />
                      </Field>
                    </>
                  ) : null}

                  <Field label="Customer note" className="md:col-span-2">
                    <Textarea
                      rows={4}
                      value={selectedMethod.instructions || ""}
                      placeholder="Optional note shown to the customer for this payment method."
                      onChange={(e) => updateMethod(selectedMethod.key, { instructions: e.target.value })}
                    />
                  </Field>

                  <div className="md:col-span-2">
                    <Switch
                      id="method-active"
                      checked={selectedMethod.active !== false}
                      onCheckedChange={(value) => updateMethod(selectedMethod.key, { active: value })}
                      label="Active"
                    />
                  </div>
                </div>
              </Card>
            </div>
          ) : null}

          <Card
            flush
            className="overflow-hidden"
            title="Payment details"
            description="Bank and wallet accounts that receive manual payments."
            actions={<Button size="sm" variant="secondary" icon={Plus} onClick={addAccount}>Add details</Button>}
          >
            {paymentConfig.accounts.length ? (
              <div className="admin-table-wrap border-t border-line">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Bank / wallet</th>
                      <th>Account number</th>
                      <th>Methods</th>
                      <th>Status</th>
                      <th className="w-12"><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentConfig.accounts.map((account, index) => {
                      const linkedMethods = paymentConfig.methods.filter((item) => item.accountKey === account.key);

                      return (
                        <tr key={`${account.key}-${index}`}>
                          <td>
                            <p className="cell-primary">{account.label || `Account ${index + 1}`}</p>
                            <p className="mt-0.5 text-xs text-subtle">{account.accountTitle || "No title yet"}</p>
                          </td>
                          <td>{account.bankName || <span className="text-subtle">Not added</span>}</td>
                          <td className="break-words">{account.accountNumber || <span className="text-subtle">Not added</span>}</td>
                          <td>{linkedMethods.length}</td>
                          <td><StatusBadge status={account.active !== false ? "active" : "inactive"} /></td>
                          <td>
                            <RowActions
                              actions={[
                                { label: `Edit ${account.label || "details"}`, icon: PencilLine, onClick: () => openAccountEditor(account.key) },
                                { label: `Remove ${account.label || "details"}`, icon: Trash2, danger: true, onClick: () => confirmRemoveAccount(index) },
                              ]}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <EmptyState
                className="border-t border-line"
                title="No payment details yet"
                description="Add the bank or wallet account customers should pay into."
                action={<Button size="sm" variant="secondary" icon={Plus} onClick={addAccount}>Add details</Button>}
              />
            )}
          </Card>

          {selectedAccount && isAccountEditorOpen ? (
            <div ref={accountEditorRef} className="scroll-mt-4">
              <Card
                title={`Edit ${selectedAccount.label || "payment details"}`}
                description="Shown to customers who choose a linked manual payment method."
                actions={
                  <>
                    <Button size="sm" variant="danger" icon={Trash2} onClick={() => confirmRemoveAccount(selectedAccountIndex)}>Remove</Button>
                    <Button size="sm" variant="ghost" icon={X} onClick={() => setIsAccountEditorOpen(false)}>Close</Button>
                  </>
                }
              >
                <div className="grid gap-4 md:grid-cols-2">
                  {[
                    ["label", "Label"],
                    ["accountTitle", "Account title"],
                    ["accountNumber", "Account number"],
                    ["bankName", "Bank / wallet"],
                    ["contactNumber", "Contact number"],
                    ["branchCode", "Branch / wallet ID"],
                  ].map(([field, label]) => (
                    <Field key={field} label={label}>
                      <Input
                        value={field === "label" ? selectedAccount.label : selectedAccount[field] || ""}
                        onChange={(e) => updateAccount(selectedAccountIndex, { [field]: e.target.value })}
                      />
                    </Field>
                  ))}
                  <Field label="Instructions" className="md:col-span-2">
                    <Textarea
                      rows={4}
                      value={selectedAccount.instructions || ""}
                      onChange={(e) => updateAccount(selectedAccountIndex, { instructions: e.target.value })}
                    />
                  </Field>
                  <div className="md:col-span-2">
                    <Switch
                      id="account-active"
                      checked={selectedAccount.active !== false}
                      onCheckedChange={(value) => updateAccount(selectedAccountIndex, { active: value })}
                      label="Keep active"
                    />
                  </div>
                </div>
              </Card>
            </div>
          ) : null}
        </TabPanel>

        <TabPanel value="pricing">
          <Card title="Booking charges" description="Update booking charges and core rate values.">
            <div className="grid gap-4 md:grid-cols-2">
              {[
                {
                  key: "dailyBaseFee",
                  label: "Daily base fee",
                  description: "Base daily amount for the booking before add-ons.",
                  value: pricing.dailyBaseFee,
                },
                {
                  key: "perGuestDailyFee",
                  label: "Per guest daily fee",
                  description: "Extra daily amount charged for each guest.",
                  value: pricing.perGuestDailyFee,
                },
                {
                  key: "mealsDailyRate",
                  label: "Meals daily rate",
                  description: "Daily meal charge added when meals are selected.",
                  value: pricing.mealsDailyRate,
                },
                {
                  key: "insuranceRate",
                  label: "Insurance (per guest)",
                  description: "Insurance amount charged per guest.",
                  value: pricing.insuranceRate,
                },
                {
                  key: "airportTransferRate",
                  label: "Airport transfer rate",
                  description: "One-time transfer charge added to the booking.",
                  value: pricing.airportTransferRate,
                },
              ].map((item) => (
                <Field key={item.key} label={item.label} hint={item.description}>
                  <Input
                    type="number"
                    value={item.value}
                    onChange={(e) => updatePricing({ [item.key]: numberInput(e.target.value) })}
                  />
                </Field>
              ))}
            </div>
          </Card>
        </TabPanel>

        <TabPanel value="hotels">
          <OptionsTable
            title="Hotel categories"
            description="Hotel options customers can pick, with their daily rates."
            noun="hotel"
            items={pricing.hotelCategories}
            onAdd={() => addOption("hotelCategories", "hotel")}
            onChange={(index, patch) => updateOption("hotelCategories", index, patch)}
            onRemove={(index) => confirmRemoveOption("hotelCategories", index, "hotel")}
          />
        </TabPanel>

        <TabPanel value="vehicles" className="space-y-5">
          <Card title="Common transport note" description="Appears in Quick Package Facts on every tour details page.">
            <Field label="Transport note">
              <Textarea
                rows={4}
                value={pricing.transportNote}
                onChange={(e) => updatePricing({ transportNote: e.target.value })}
                placeholder="This note appears in Quick Package Facts on every tour details page."
              />
            </Field>
          </Card>
          <OptionsTable
            title="Vehicle types"
            description="Vehicle options customers can pick, with their daily rates."
            noun="vehicle"
            items={pricing.vehicleTypes}
            onAdd={() => addOption("vehicleTypes", "vehicle")}
            onChange={(index, patch) => updateOption("vehicleTypes", index, patch)}
            onRemove={(index) => confirmRemoveOption("vehicleTypes", index, "vehicle")}
          />
        </TabPanel>
      </Tabs>
    </div>
  );
};

export default BookingPricingSettings;
