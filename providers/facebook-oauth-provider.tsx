"use client";

const FACEBOOK_APP_ID = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID;

export function FacebookAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // If Facebook App ID is not configured, just return children without Facebook OAuth
  if (!FACEBOOK_APP_ID) {
    console.warn(
      "Warning: NEXT_PUBLIC_FACEBOOK_APP_ID is not set. Facebook authentication will not work."
    );
    return <>{children}</>;
  }

  return <>{children}</>;
}
