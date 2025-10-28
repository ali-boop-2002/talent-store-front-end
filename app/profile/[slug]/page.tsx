export const dynamic = "force-dynamic";
export const revalidate = 0;
import UserProfilePage from "@/components/UserProfilePage";

const ProfilePage = async ({ params }: { params: { slug: string } }) => {
  const { slug } = await params;

  const response = await fetch(
    `http://localhost:3000/api/find-talent/${slug}`,
    { cache: "no-store" }
  );

  const data = await response.json();

  return (
    <div className="min-h-screen bg-gray-100">
      <UserProfilePage data={data} />
    </div>
  );
};

export default ProfilePage;
