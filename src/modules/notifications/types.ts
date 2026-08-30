import {
  UserPlus,
  UserMinus,
  ShieldCheck,
  MailX,
  CreditCard,
  AlertTriangle,
  type LucideIcon,
} from "lucide-react";
import { type NotificationType } from "@/generated/prisma/client";

export type NotificationConfig = {
  icon: LucideIcon;
  color: string;
  defaultTitle: string;
  defaultInApp: boolean;
  defaultEmail: boolean;
  label: string;
  category: "members" | "billing";
};

export const notificationConfig: Record<NotificationType, NotificationConfig> = {
  MEMBER_INVITED: {
    icon: UserPlus,
    color: "text-green-500",
    defaultTitle: "You've been invited",
    defaultInApp: true,
    defaultEmail: true,
    label: "Member invited",
    category: "members",
  },
  MEMBER_JOINED: {
    icon: UserPlus,
    color: "text-green-500",
    defaultTitle: "New member joined",
    defaultInApp: true,
    defaultEmail: false,
    label: "Member joined",
    category: "members",
  },
  MEMBER_REMOVED: {
    icon: UserMinus,
    color: "text-red-500",
    defaultTitle: "You were removed",
    defaultInApp: true,
    defaultEmail: true,
    label: "Member removed",
    category: "members",
  },
  MEMBER_ROLE_CHANGED: {
    icon: ShieldCheck,
    color: "text-yellow-500",
    defaultTitle: "Your role was changed",
    defaultInApp: true,
    defaultEmail: true,
    label: "Role changed",
    category: "members",
  },
  INVITATION_REVOKED: {
    icon: MailX,
    color: "text-orange-500",
    defaultTitle: "Invitation revoked",
    defaultInApp: true,
    defaultEmail: false,
    label: "Invitation revoked",
    category: "members",
  },
  BILLING_SUBSCRIPTION_CREATED: {
    icon: CreditCard,
    color: "text-green-500",
    defaultTitle: "Subscription activated",
    defaultInApp: true,
    defaultEmail: true,
    label: "Subscription created",
    category: "billing",
  },
  BILLING_SUBSCRIPTION_UPDATED: {
    icon: CreditCard,
    color: "text-blue-500",
    defaultTitle: "Subscription updated",
    defaultInApp: true,
    defaultEmail: false,
    label: "Subscription updated",
    category: "billing",
  },
  BILLING_SUBSCRIPTION_CANCELED: {
    icon: CreditCard,
    color: "text-red-500",
    defaultTitle: "Subscription canceled",
    defaultInApp: true,
    defaultEmail: true,
    label: "Subscription canceled",
    category: "billing",
  },
  BILLING_SUBSCRIPTION_RESUMED: {
    icon: CreditCard,
    color: "text-green-500",
    defaultTitle: "Subscription resumed",
    defaultInApp: true,
    defaultEmail: false,
    label: "Subscription resumed",
    category: "billing",
  },
  BILLING_SUBSCRIPTION_DELETED: {
    icon: CreditCard,
    color: "text-red-500",
    defaultTitle: "Subscription ended",
    defaultInApp: true,
    defaultEmail: true,
    label: "Subscription ended",
    category: "billing",
  },
  INVOICE_PAYMENT_FAILED: {
    icon: AlertTriangle,
    color: "text-red-500",
    defaultTitle: "Payment failed",
    defaultInApp: true,
    defaultEmail: true,
    label: "Payment failed",
    category: "billing",
  },
};
