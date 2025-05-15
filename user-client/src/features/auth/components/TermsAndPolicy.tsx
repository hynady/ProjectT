export const TermsAndPolicy = () => (
  <p className="text-center text-xs sm:text-sm text-muted-foreground">
    By continue access, you agree to our
    <br/>
    <a
      href="/terms"
      className="underline underline-offset-4 hover:text-primary transition-colors duration-200"
    >
      Terms of Service
    </a>{" "}
    and{" "}
    <a
      href="/privacy"
      className="underline underline-offset-4 hover:text-primary transition-colors duration-200"
    >
      Privacy Policy
    </a>
    .
  </p>
)