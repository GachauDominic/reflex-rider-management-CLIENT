import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Navigate, useLocation, useNavigate, type Location } from "react-router";
import { loginSchema, type LoginFormValues } from "../lib/validation";
import { useLoginMutation } from "../api/authApi";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { credentialsSet } from "../features/auth/authSlice";
import { getErrorMessage } from "../components/Feedback";

export default function LoginPage() {
  const token = useAppSelector((state) => state.auth.token);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [login, { isLoading, error }] = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: yupResolver(loginSchema) });

  // Already signed in — don't show the login form again.
  if (token) {
    const from = (location.state as { from?: Location })?.from?.pathname ?? "/";
    return <Navigate to={from} replace />;
  }

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const result = await login(values).unwrap();
      dispatch(credentialsSet(result));
      navigate("/", { replace: true });
    } catch {
      // Surfaced below via the `error` state from useLoginMutation() —
      // nothing further to do here.
    }
  };

  return (
    <div className="flex min-h-dvh items-center justify-center bg-base-200 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-display text-2xl font-bold text-primary">Reflex</h1>
          <p className="mt-1 text-sm text-base-content/60">Delivery coordination, tracked end to end.</p>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit, () => {
            /* validation errors already render inline below */
          })}
          className="card border border-base-300 bg-base-100 shadow-sm"
        >
          <div className="card-body gap-3">
            <label className="form-control">
              <span className="label-text mb-1">Email</span>
              <input
                type="email"
                autoComplete="username"
                className="input input-bordered w-full"
                {...register("email")}
              />
              {errors.email && <span className="mt-1 text-sm text-error">{errors.email.message}</span>}
            </label>

            <label className="form-control">
              <span className="label-text mb-1">Password</span>
              <input
                type="password"
                autoComplete="current-password"
                className="input input-bordered w-full"
                {...register("password")}
              />
              {errors.password && <span className="mt-1 text-sm text-error">{errors.password.message}</span>}
            </label>

            {error && <p className="text-sm text-error">{getErrorMessage(error, "Could not log in")}</p>}

            <button type="submit" className="btn btn-primary mt-2" disabled={isLoading}>
              {isLoading ? "Signing in…" : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
