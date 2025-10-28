import { LoginForm } from "@/components/login-form";

import img from "@/public/images/const.jpg";

const SignInPage = () => {
  // const { isAuthenticated, loading } = useAuth();

  // useEffect(() => {
  //   if (!loading && isAuthenticated) {
  //     window.location.href = "/";
  //   }
  // }, [isAuthenticated, loading]);

  // if (loading) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
  //     </div>
  //   );
  // }

  return (
    <div className="min-h-screen">
      <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm md:max-w-3xl">
          <LoginForm img={img} />
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
