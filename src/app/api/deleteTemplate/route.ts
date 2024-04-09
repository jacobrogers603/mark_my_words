import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import authOptions from "../../../../auth";
export const dynamic = 'force-dynamic';

export async function DELETE(req: Request) {
  try {
    const { templateId } = await req.json();

    const session = await getServerSession(authOptions);

    if (session) {
      try {
        const user = await prismadb.user.findUnique({
          where: {
            email: session?.user?.email || "",
          },
        });

        if (!user) {
          console.log("user not found");
          return NextResponse.json({ error: "User not found" });
        }

        const userId = user?.id;

        // Delete the template
        const templateToDelete = await prismadb.template.findUnique({
          where: {
            id: templateId,
          },
        });

        if (!templateToDelete) {
          return NextResponse.json({ error: "Template not found" });
        }

        await prismadb.template.delete({
          where: {
            id: templateId,
          },
        });

        // Update the user's templates array to remove the deleted template.
        await prismadb.user.update({
          where: {
            id: userId,
          },
          data: {
            templateIDs: {
              set: (
                await prismadb.user.findUnique({
                  where: { id: userId },
                })
              )?.templateIDs.filter((id) => id !== templateId),
            },
          },
        });
        return NextResponse.json({ success: true });
      } catch (error) {
        return NextResponse.json(error);
      }
    } else {
      // Handle the case where there is no session
      console.log("no session");
      return new Response(null, { status: 401 }); // 401 Unauthorized
    }
  } catch (error) {
    console.log(error);
    return NextResponse.json(error);
  }
};
