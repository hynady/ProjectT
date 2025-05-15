import { UserInfo, UserProfileCard } from "../internal-types/settings.types";

export const settingsMockData = {
  userInfo: {
    id: "usr_123456789",
    name: "Nguyễn Thanh Long",
    email: "long.nguyen@example.com",
    avatar: "https://ui-avatars.com/api/?name=Nguyen+Thanh+Long&background=random",
    birthday: new Date("1995-05-15")
  } as UserInfo,
  
  profileCards: [
    {
      id: "profile_1",
      name: "Nguyễn Thanh Long",
      phoneNumber: "0912345678",
      email: "long.nguyen@example.com",
      isDefault: true
    },
    {
      id: "profile_2",
      name: "Công ty TNHH ABC",
      phoneNumber: "0987654321",
      email: "contact@abc.com",
      isDefault: false
    }
  ] as UserProfileCard[]
};
