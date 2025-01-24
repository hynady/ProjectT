import AuthForm from "@/features/auth/blocks/AuthForm.tsx";

export const ResetPassword = ({hideNavigation, noPadding}: { hideNavigation: boolean; noPadding: boolean }) => {
  return <AuthForm hideNavigation={hideNavigation} noPadding={noPadding} type="reset"/>;
};