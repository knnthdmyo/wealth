"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type RegisterForm = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({ resolver: zodResolver(schema) });

  const mutation = useMutation({
    mutationFn: async (values: RegisterForm) => {
      const { data, error } = await supabase.auth.signUp(values);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      router.replace("/dashboard");
    },
  });

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      {/* Top Half - Green Background with Patterns */}
      <div className="absolute inset-x-0 top-0 h-[55vh] bg-gradient-to-br from-teal-400 via-teal-500 to-emerald-500 overflow-hidden">
        {/* Background Pattern Circles */}
        <div className="absolute top-10 left-10 h-32 w-32 rounded-full border-4 border-white/10" />
        <div className="absolute top-20 right-20 h-24 w-24 rounded-full border-4 border-white/10" />
        <div className="absolute top-40 left-1/4 h-20 w-20 rounded-full bg-white/5" />
        <div className="absolute bottom-20 right-1/3 h-28 w-28 rounded-full border-4 border-white/10" />
        
        {/* Line Graph Pattern */}
        <svg className="absolute inset-0 h-full w-full opacity-20" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Trending Line Graph */}
          <path
            d="M 0 300 Q 100 250, 200 280 T 400 240 T 600 200 T 800 180"
            stroke="white"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            opacity="0.4"
          />
          <path
            d="M 0 350 Q 120 320, 240 340 T 480 300 T 720 270"
            stroke="white"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            opacity="0.3"
          />
        </svg>

        {/* Decorative Icons */}
        <div className="absolute top-16 right-12 text-white/20 text-4xl">📈</div>
        <div className="absolute top-32 left-16 text-white/20 text-3xl">💰</div>
        <div className="absolute bottom-24 left-12 text-white/20 text-3xl">📊</div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-4 pt-20 pb-8">
        <div className="w-full max-w-[420px] space-y-6">
          {/* Welcome Text */}
          <div className="text-center text-white mb-8">
            <h1 className="text-3xl font-bold mb-2">Join Wealth</h1>
            <p className="text-teal-50">Start tracking your financial journey</p>
          </div>

          {/* Register Card */}
          <form
            onSubmit={handleSubmit((values) => mutation.mutate(values))}
            className="card space-y-4 shadow-2xl"
          >
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Create account</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Track assets, liabilities, and net worth
              </p>
            </div>
          <div className="space-y-1">
            <label className="label" htmlFor="email">
              Email
            </label>
            <input id="email" className="input" type="email" {...register("email")} />
            {errors.email ? <p className="text-xs text-rose-500">{errors.email.message}</p> : null}
          </div>

          <div className="space-y-1">
            <label className="label" htmlFor="password">
              Password
            </label>
            <input id="password" className="input" type="password" {...register("password")} />
            {errors.password ? (
              <p className="text-xs text-rose-500">{errors.password.message}</p>
            ) : null}
          </div>

          {mutation.error ? (
            <p className="text-xs text-rose-500">{mutation.error.message}</p>
          ) : null}

          <button
            type="submit"
            className="w-full rounded-xl bg-teal-500 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-600 disabled:opacity-50"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <span className="flex items-center justify-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Creating account...
              </span>
            ) : (
              "Create account"
            )}
          </button>
        </form>

        <p className="text-center text-sm text-slate-600 dark:text-slate-400">
          Already have an account?{" "}
          <Link className="font-semibold text-teal-600 dark:text-teal-400" href="/login">
            Sign in
          </Link>
        </p>
        </div>
      </div>
    </div>
  );
}
