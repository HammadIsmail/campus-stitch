"use client";

import * as React from "react";
import { useRouter } from "next/navigation";

export default function CommunityPostPage() {
  const router = useRouter();

  React.useEffect(() => {
    router.replace("/services");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] text-xs text-zinc-500">
      Redirecting to campus modules...
    </div>
  );
}
