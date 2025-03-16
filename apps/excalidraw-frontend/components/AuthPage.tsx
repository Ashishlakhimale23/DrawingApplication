"use client"
import axios from 'axios';
import React, { useState, FormEvent } from 'react';
import { ZodValidation } from '@repo/common/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AuthPage({signup}: {signup: boolean}) {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError("");

        const result = ZodValidation({username, email, password});

        if (!result.result) {
            setError(result.errormessage);
            return;
        }

        try {
            const phrase = signup ? "signup" : "signin";
            const response = await axios.post(`http://localhost:8000/user/${phrase}`, {
                username,
                email,
                password
            });

            if (response.status === 200) {
                localStorage.setItem("authtoken", response.data.token);
                router.push("/canvas/2");
            }
        } catch (err:any) {
            setError(err.response?.data?.message || "An error occurred");
        }
    };

    return (
        <div className="min-h-screen bg-black relative flex items-center justify-center p-4 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -mt-20 -mr-20 bg-gradient-to-r from-gray-100 to-gray-500"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full -mb-20 -ml-20"></div>

            <div className="w-full max-w-md rounded-lg shadow-xl p-8 z-10 bg-gray-900">
                {!signup && (
                    <Link href="/signup" className="flex items-center text-gray-400 mb-8 hover:text-white transition-colors">
                        <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </Link>
                )}

                
                <div className="flex justify-center mb-6">
                    
                </div>

                <h1 className="text-2xl font-medium text-white text-center mb-2">
                    {signup ? "Create an account" : "Welcome back!"}
                </h1>

                <div className="text-gray-400 text-center mb-8">
                    {signup ? "Already have an account?" : "First time here?"}{" "}
                    <Link href={signup ? "/signin" : "/signup"} className="text-white hover:underline">
                        {signup ? "Sign in" : "Sign up"} for free
                    </Link>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 rounded p-3 mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="email"
                            className="w-full p-3 bg-gray-800 rounded border-0 text-white placeholder-gray-500 focus:ring-2 focus:ring-white focus:outline-none"
                            placeholder="Your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    
                    
                        <div>
                            <input
                                type="text"
                                className="w-full p-3 bg-gray-800 rounded border-0 text-white placeholder-gray-500 focus:ring-2 focus:ring-white focus:outline-none"
                                placeholder="Your username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                            />
                        </div>
                    

                    <div>
                        <input
                            type="password"
                            className="w-full p-3 bg-gray-800 rounded border-0 text-white placeholder-gray-500 focus:ring-2 focus:ring-white focus:outline-none"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-3 bg-white text-black font-medium rounded-full hover:bg-gray-200 transition-colors"
                    >
                        {signup ? "Sign up" : "Sign in"}
                    </button>
                </form>

                <div className="text-gray-500 text-xs text-center mt-6">
                    By continuing, you agree to our{" "}
                    <Link href="/terms" className="text-gray-400 hover:text-white">
                        Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-gray-400 hover:text-white">
                        Privacy Policy
                    </Link>
                </div>
            </div>
        </div>
    );
}
