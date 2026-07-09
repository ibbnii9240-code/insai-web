import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const ALLOWED_STATUS = ["active","suspended","deleted"] as const;
type UserStatus = typeof ALLOWED_STATUS[number];

function serialize(user:any){
  return {
    id:String(user._id),
    email:user.email||"",
    name:user.name||"",
    nickname:user.nickname||"",
    avatar:user.avatar||"",
    provider:user.provider||"",
    providerId:user.providerId||"",
    role:user.role||"user",
    status:user.status||"active",
    isProfileCompleted:Boolean(user.isProfileCompleted),
    lastLoginAt:user.lastLoginAt||null,
    createdAt:user.createdAt,
    updatedAt:user.updatedAt,
  };
}

export async function GET(_req:Request,ctx:RouteContext){
  await connectDB();
  const {id}=await ctx.params;
  const user=await User.findById(id).lean();
  if(!user){
    return NextResponse.json({ok:false,message:"유저를 찾을 수 없습니다."},{status:404});
  }
  return NextResponse.json({ok:true,user:serialize(user)});
}

export async function PATCH(req:Request,ctx:RouteContext){
  try{
    await connectDB();
    const {id}=await ctx.params;
    const body=await req.json();

    const user=await User.findById(id);
    if(!user){
      return NextResponse.json({ok:false,message:"유저를 찾을 수 없습니다."},{status:404});
    }

    if(body.status){
      if(!ALLOWED_STATUS.includes(body.status)){
        return NextResponse.json({ok:false,message:"올바르지 않은 상태입니다."},{status:400});
      }
      user.status=body.status as UserStatus;
    }

    if(typeof body.role==="string"){
      user.role=body.role;
    }

    await user.save();

    return NextResponse.json({
      ok:true,
      message:"유저 정보가 수정되었습니다.",
      user:serialize(user),
    });
  }catch(e){
    console.error(e);
    return NextResponse.json({ok:false,message:"유저 수정 중 오류가 발생했습니다."},{status:500});
  }
}

export async function DELETE(_req:Request,ctx:RouteContext){
  try{
    await connectDB();
    const {id}=await ctx.params;
    const user=await User.findById(id);
    if(!user){
      return NextResponse.json({ok:false,message:"유저를 찾을 수 없습니다."},{status:404});
    }
    user.status="deleted";
    await user.save();

    return NextResponse.json({
      ok:true,
      message:"유저가 탈퇴 처리되었습니다.",
      user:serialize(user),
    });
  }catch(e){
    console.error(e);
    return NextResponse.json({ok:false,message:"탈퇴 처리 중 오류가 발생했습니다."},{status:500});
  }
}
