import AuthForm from "@/features/auth/blocks/AuthForm.tsx";

export const ResetPassword = ({hideNavigation=false, noPadding=false}: { hideNavigation?: boolean; noPadding?: boolean }) => {
  return <AuthForm hideNavigation={hideNavigation} noPadding={noPadding} type="reset"/>;
};