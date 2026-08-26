"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createApiKey, revokeApiKey } from "@/modules/settings/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Copy, Key, Loader2, Plus, Trash2 } from "lucide-react";

type ApiKey = {
  id: string;
  name: string;
  lastFour: string;
  lastUsedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
  user: { name: string | null; email: string };
};

export function ApiKeyList({
  apiKeys,
  orgId,
  canCreate,
  canDelete,
}: {
  apiKeys: ApiKey[];
  orgId: string;
  canCreate: boolean;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expiresIn, setExpiresIn] = useState("never");

  async function handleCreate(formData: FormData) {
    setIsCreating(true);
    setError(null);
    const result = await createApiKey(orgId, formData);
    setIsCreating(false);

    if (result.success && result.key) {
      setRevealedKey(result.key);
      router.refresh();
    } else {
      const msg =
        typeof result.error === "string"
          ? result.error
          : "Failed to create API key";
      setError(msg);
    }
  }

  async function handleRevoke(id: string) {
    setRevokingId(id);
    const result = await revokeApiKey(orgId, id);
    if (result.success) {
      toast.success("API key revoked.");
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setRevokingId(null);
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard.");
  }

  function isExpired(expiresAt: Date | null) {
    return expiresAt ? new Date(expiresAt) < new Date() : false;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>API Keys</CardTitle>
            <CardDescription>
              Keys are shown once on creation. Store them securely.
            </CardDescription>
          </div>
          {canCreate && (
            <Dialog
              open={createOpen}
              onOpenChange={(v) => {
                setCreateOpen(v);
                if (!v) {
                  setRevealedKey(null);
                  setError(null);
                  setExpiresIn("never");
                }
              }}
            >
              <DialogTrigger render={<Button size="sm" />}>
                <Plus className="mr-2 h-4 w-4" />
                Create key
              </DialogTrigger>
              <DialogContent>
                {revealedKey ? (
                  <>
                    <DialogHeader>
                      <DialogTitle>API key created</DialogTitle>
                      <DialogDescription>
                        Copy this key now. You won&apos;t be able to see it again.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 rounded border bg-muted px-3 py-2 text-xs break-all">
                        {revealedKey}
                      </code>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleCopy(revealedKey)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <DialogFooter>
                      <DialogClose render={<Button />}>Done</DialogClose>
                    </DialogFooter>
                  </>
                ) : (
                  <form action={handleCreate}>
                    <DialogHeader>
                      <DialogTitle>Create API key</DialogTitle>
                      <DialogDescription>
                        Give it a descriptive name so you remember what it&apos;s for.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="key-name">Name</Label>
                        <Input
                          id="key-name"
                          name="name"
                          placeholder="e.g. Production server"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="key-expiry">Expiration</Label>
                        <input type="hidden" name="expiresIn" value={expiresIn} />
                        <Select value={expiresIn} onValueChange={(v) => { if (v) setExpiresIn(v); }}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="never">Never</SelectItem>
                            <SelectItem value="30d">30 days</SelectItem>
                            <SelectItem value="60d">60 days</SelectItem>
                            <SelectItem value="90d">90 days</SelectItem>
                            <SelectItem value="1y">1 year</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {error && (
                        <p className="text-sm text-destructive">{error}</p>
                      )}
                    </div>
                    <DialogFooter className="mt-4">
                      <Button type="submit" disabled={isCreating}>
                        {isCreating && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Create
                      </Button>
                    </DialogFooter>
                  </form>
                )}
              </DialogContent>
            </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {apiKeys.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Key className="mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              No API keys yet. Create one to get started.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last used</TableHead>
                <TableHead>Expires</TableHead>
                {canDelete && <TableHead className="w-[60px]" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeys.map((key) => {
                const expired = isExpired(key.expiresAt);
                return (
                  <TableRow key={key.id}>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{key.name}</p>
                        <p className="text-xs text-muted-foreground">
                          by {key.user.name ?? key.user.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs text-muted-foreground">
                        sk_live_...{key.lastFour}
                      </code>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(key.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {key.lastUsedAt
                        ? new Date(key.lastUsedAt).toLocaleDateString()
                        : "Never"}
                    </TableCell>
                    <TableCell>
                      {key.expiresAt ? (
                        expired ? (
                          <Badge variant="destructive">Expired</Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            {new Date(key.expiresAt).toLocaleDateString()}
                          </span>
                        )
                      ) : (
                        <span className="text-sm text-muted-foreground">Never</span>
                      )}
                    </TableCell>
                    {canDelete && (
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={revokingId === key.id}
                          onClick={() => handleRevoke(key.id)}
                        >
                          {revokingId === key.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-destructive" />
                          )}
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
