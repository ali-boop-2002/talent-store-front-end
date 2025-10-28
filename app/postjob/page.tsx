"use client";
export const dynamic = "force-dynamic";

import { Button } from "@/components/ui/button";
import { jobPostSchema } from "@/types";
import { JobPost } from "@/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const PostAJob = () => {
  const [skillsInput, setSkillsInput] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<JobPost>({
    resolver: zodResolver(jobPostSchema),
    mode: "onChange",
  });
  const submit = async (data: JobPost) => {
    try {
      // Transform skills string to arr
      // const transformedData = {
      //   ...data,
      //   skills:
      //     data.skills && data.skills.trim() !== ""
      //       ? data.skills.split(",").map((skill: string) => skill.trim())
      //       : [],
      // };

      const response = await fetch(`http://localhost:3000/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      if (response.ok) {
        toast.success("job posted successfully");
        reset();
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message as string);
      } else {
        toast.error("Error posting");
      }
      console.log(error);
    }
  };
  return (
    <div className="min-h-screen flex flex-col bg-gray-100 justify-center items-center text-2xl">
      <div className="font-bold m-4">Post a job</div>
      <form onSubmit={handleSubmit(submit)}>
        <div className="flex flex-col bg-white p-4 m-4 rounded-2xl text-xl shadow-2xl space-y-4">
          <label htmlFor="post" className="font-bold">
            Title of the post
          </label>

          <textarea
            id="post"
            {...register("title")}
            className={`bg-white border-2 rounded p-2 ${
              errors.title
                ? "border-red-500"
                : "focus:outline-2 focus:outline-purple-700"
            } `}
            placeholder="please specifiy what kind of job you need done"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
          <label htmlFor="description" className="font-bold">
            Description of the job
          </label>

          <textarea
            id="post"
            {...register("description")}
            className={`bg-white border-2 rounded p-2 ${
              errors.description
                ? "border-red-500"
                : "focus:outline-2 focus:outline-purple-700"
            } `}
            placeholder="please specifiy what kind of job you need done"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">
              {errors.description.message}
            </p>
          )}
          <label htmlFor="category" className="font-bold">
            Please specifiy the category of the job
          </label>
          <input
            id="category"
            type="text"
            {...register("category")}
            className={`bg-white border-2 rounded   p-2  ${
              errors.category
                ? "border-red-500"
                : "focus:outline-2 focus:outline-purple-700"
            }`}
            placeholder="plumbing,heating eg..."
          ></input>
          {errors.category && (
            <p className="mt-1 text-sm text-red-600">
              {errors.category.message}
            </p>
          )}
          <div>
            <label htmlFor="skills" className="font-bold">
              Please specifiy the skills required for the job
            </label>
            <p className="text-sm text-blue-500 truncate">
              hint: you can add multiple skills by separating them with a comma
              it will help us find the best talent for you
            </p>
          </div>
          <input
            id="skills"
            type="text"
            {...register("skills")}
            className={`bg-white border-2 rounded   p-2  ${
              errors.skills
                ? "border-red-500"
                : "focus:outline-2 focus:outline-purple-700"
            }`}
            onChange={(e) => {
              setSkillsInput(e.target.value);
            }}
            placeholder="plumbing,heating,electrician eg..."
          ></input>
          {skillsInput && (
            <div className="flex gap-2 flex-wrap">
              {skillsInput.split(",").map(
                (skill, i) =>
                  skill.trim() && (
                    <span
                      key={i}
                      className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-sm"
                    >
                      {skill.trim()}
                    </span>
                  )
              )}
            </div>
          )}
          {errors.skills && (
            <p className="mt-1 text-sm text-red-600">{errors.skills.message}</p>
          )}
          <label htmlFor="timeline" className="font-bold">
            Provide a reasonable timeline how long this job can take
          </label>
          <input
            {...register("timeline")}
            className={`bg-white border-2 rounded   p-2 ${
              errors.timeline
                ? "border-red-500"
                : "focus:outline-2 focus:outline-purple-700"
            } `}
            id="timeline"
            type="text"
            placeholder="more than 2 months, 2 days eg.."
          ></input>
          {errors.timeline && (
            <p className="mt-1 text-sm text-red-600">
              {errors.timeline.message}
            </p>
          )}
          <label className="font-bold">payemnt type</label>
          <select
            {...register("paymentType")}
            className={`bg-white border-2 rounded  p-2 ${
              errors.paymentType
                ? "border-red-500"
                : "focus:outline-2  focus:outline-purple-700"
            } `}
          >
            <option id="HOURLY" value="HOURLY">
              hourly
            </option>
            <option id="FIXED" value="FIXED">
              fixed
            </option>
          </select>
          {errors.paymentType && (
            <p className="mt-1 text-sm text-red-600">
              {errors.paymentType.message}
            </p>
          )}
          <label className="font-bold">status</label>
          <select
            {...register("status")}
            className={`bg-white border-2 rounded  p-2 ${
              errors.status
                ? "border-red-500"
                : "focus:outline-2  focus:outline-purple-700"
            } `}
          >
            <option value="OPEN">OPEN</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
          {errors.status && (
            <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
          )}
          <label className="font-bold">budget</label>
          <input
            {...register("budget", { valueAsNumber: true })}
            className={`bg-white border-2 rounded  p-2 ${
              errors.budget
                ? "border-red-500"
                : "focus:outline-2 focus:outline-purple-700"
            } `}
            type="number"
            placeholder="40 per hour 500 fixed price"
          ></input>
          {errors.budget && (
            <p className="mt-1 text-sm text-red-600">{errors.budget.message}</p>
          )}
          <Button type="submit">
            {isSubmitting ? <Loader className="animate-spin" /> : "Submit"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PostAJob;
