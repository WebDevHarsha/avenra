"use client";
import { useRouter } from 'next/navigation';

export default function SimulationPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-16">
            <div className="max-w-3xl w-full bg-white shadow rounded-lg p-8">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 flex items-center justify-center rounded-full bg-yellow-100 text-yellow-800 text-2xl font-bold">
                        🚧
                    </div>
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Simulation</h1>
                        <p className="text-gray-600 mt-1">This page is under construction. We are working on an interactive simulation feature.</p>
                    </div>
                </div>

                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                    <button
                        onClick={() => router.push('/analyze')}
                        className="
                            w-full
                            sm:w-auto
                            px-4 py-2
                            sm:px-6 sm:py-3
                            text-sm sm:text-base
                            bg-blue-600 hover:bg-blue-700
                            text-white rounded-lg font-medium
                            transition-colors duration-150
                            focus:outline-none focus:ring-2 focus:ring-blue-300
                        "
                        aria-label="Back to Analysis"
                    >
                        Back to Analysis
                    </button>
                </div>
            </div>
        </div>
    );
}
