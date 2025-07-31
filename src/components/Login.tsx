import React, { useState } from 'react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement login logic
    console.log('Login attempt:', { email, password });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Status Bar */}
      <div className="h-6 bg-white flex items-center justify-between px-4 text-xs">
        <div className="flex items-center space-x-1">
          <div className="w-4 h-2 bg-black rounded-sm"></div>
          <div className="w-4 h-2 bg-black rounded-sm"></div>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-6 h-2 bg-black rounded-sm"></div>
          <div className="w-6 h-2 bg-black rounded-sm"></div>
        </div>
      </div>

      {/* Navigation Header */}
      <header className="bg-white h-11 flex items-center justify-center border-b border-gray-200">
        <h1 className="text-xl font-semibold text-gray-900 font-pretendard">
          로그인
        </h1>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center px-4">
        {/* Logo */}
        <div className="mt-16 mb-24">
          <h2 className="text-4xl font-extrabold text-black font-pretendard">
            LOGO
          </h2>
        </div>

        {/* Login Form */}
        <div className="w-full max-w-sm">
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Email Input */}
            <div className="bg-gray-100 rounded-lg p-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일 주소 입력"
                className="w-full bg-transparent text-gray-900 placeholder-gray-500 outline-none font-pretendard"
                required
              />
            </div>

            {/* Password Input */}
            <div className="bg-gray-100 rounded-lg p-3 flex items-center">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호 입력"
                className="flex-1 bg-transparent text-gray-900 placeholder-gray-500 outline-none font-pretendard"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="ml-2 p-1 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {showPassword ? (
                    // Eye open icon
                    <path
                      d="M10 3C5 3 1.73 7.11 1 10c.73 2.89 4 7 9 7s8.27-4.11 9-7c-.73-2.89-4-7-9-7zm0 12c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"
                      fill="currentColor"
                    />
                  ) : (
                    // Eye closed icon
                    <path
                      d="M10.94 6.08A6.93 6.93 0 0110 6c-3.18 0-6.17 2.29-7.91 6a15.23 15.23 0 001.57 2.1l1.5-1.5C5.05 12.2 5 11.61 5 11c0-1.48.81-2.75 2-3.43L5.64 6.2a8.33 8.33 0 00-3.73 2.77l-.91-1.06C2.1 6.26 5.94 4 10 4a8.26 8.26 0 013.65.84l-1.24 1.24a6.08 6.08 0 00-1.47 0zm4.36 9.92l-1.5-1.5c.1-.4.2-.8.2-1.2 0-2.21-1.79-4-4-4-.4 0-.8.1-1.2.2L7.3 8.0A6 6 0 0110 7c2.76 0 5 2.24 5 5a6.08 6.08 0 01-.7 2.5zm3.53-1.29L3.17 2.83 2.1 3.9l1.85 1.85C2.83 6.94 1.73 8.81 1 11c.73 2.89 4 7 9 7a8.26 8.26 0 003.65-.84l1.85 1.85 1.06-1.06z"
                      fill="currentColor"
                    />
                  )}
                </svg>
              </button>
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <button
                type="button"
                className="text-sm text-gray-600 font-light font-pretendard hover:text-gray-800 transition-colors"
              >
                비밀번호 찾기
              </button>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium font-pretendard hover:bg-blue-700 transition-colors mt-6"
            >
              로그인
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-33 bg-gray-300 flex items-center justify-center">
        <p className="text-xl font-bold text-gray-800 font-pretendard">Footer</p>
      </footer>
    </div>
  );
};

export default Login;
