export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1. 라우팅 로직: URL 경로가 /api/analyze 인 경우에만 실행
    if (url.pathname === "/api/analyze" || url.pathname === "/api/analyze/") {
      
      // OPTIONS 요청 처리 (CORS 프리플라이트)
      if (request.method === "OPTIONS") {
        return new Response(null, {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, X-Api-Key",
          },
        });
      }

      // POST 요청 처리 (실제 API 로직)
      if (request.method === "POST") {
        try {
          const body = await request.json();
          const apiKey = request.headers.get("X-Api-Key");

          if (!apiKey) {
            return new Response(JSON.stringify({ error: { message: "API 키가 없습니다." } }), {
              status: 400,
              headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
            });
          }

          const response = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-api-key": apiKey,
              "anthropic-version": "2023-06-01"
            },
            body: JSON.stringify(body)
          });

          const data = await response.json();
          return new Response(JSON.stringify(data), {
            status: response.status,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
          });

        } catch (err) {
          return new Response(JSON.stringify({ error: { message: err.message } }), {
            status: 500,
            headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
          });
        }
      }
    }

    // 2. 경로가 API가 아닌 경우: 원래 웹사이트 파일(index.html 등)을 그대로 보여줌
    return env.ASSETS.fetch(request);
  },
};
