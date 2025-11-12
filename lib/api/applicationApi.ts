// lib/api/applicationApi.ts
import { Application } from "@/types/types";
import { API_URL } from "@/lib/config";

class ApplicationAPI {
  private baseUrl = API_URL;

  async getByJobId(jobId: string) {
    const response = await fetch(
      `${this.baseUrl}/api/get-application-by-job-id/${jobId}`,
      {
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      }
    );

    if (!response.ok) throw new Error("Failed to fetch");
    const data = await response.json();

    return data.applications || [];
  }

  //   async submit(data: Application) {
  //     const response = await fetch(`${this.baseUrl}/api/applications`, {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       credentials: "include",
  //       body: JSON.stringify(data),
  //     });

  //     if (!response.ok) throw new Error("Failed to submit");
  //     return response.json();
  //   }
}

export const applicationAPI = new ApplicationAPI();
