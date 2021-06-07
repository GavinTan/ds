/**
 * @see https://umijs.org/zh-CN/plugins/plugin-access
 * */
export default function access(initialState: { currentUser?: API.UserResult | undefined }) {
  const { currentUser } = initialState || {};

  return {
    admin: currentUser && currentUser.role?.includes('admin'),
    user: currentUser && currentUser.role?.includes('user') || currentUser?.role?.includes('admin'),
  };
}
