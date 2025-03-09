import React, { useEffect } from "react";
import { Search, UserMinus, UserPlus, CheckCircle, XCircle } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useFriendsStore } from "../store/useFriendStore"; // ✅ Fixed import
import { useConfirmation } from "../components/ConfirmationModal";

const AddFriends = () => {
  const confirmAction = useConfirmation();
  const { authUser } = useAuthStore();

  const {
    friends,
    receivedRequests, // ✅ Fixed spelling
    sentRequests,
    sendFriendRequest,
    cancelFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    removeFriend,
    fetchFriends,
    fetchSentRequests,
    fetchReceivedRequests, // ✅ Fixed spelling
    searchQuery,
    setSearchQuery,
    searchResults,
    searchUsers,
    isSearchingUsers,
  } = useFriendsStore();

  useEffect(() => {
    fetchFriends();
    fetchSentRequests();
    fetchReceivedRequests();
  }, [fetchFriends, fetchSentRequests, fetchReceivedRequests]); // ✅ Dependency fix

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      searchUsers(searchQuery);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, searchUsers]); // ✅ Added `searchUsers` to dependency array

  const handleAction = async (action, message, id) => {
    const confirmed = await confirmAction(message);
    if (confirmed) action(id);
  };

  if (!authUser) return <p className="text-center">Loading...</p>; // ✅ Ensure authUser exists

  return (
    <div className="min-h-screen bg-base-200 flex justify-center pt-20 px-4">
      <div className="bg-base-100 rounded-lg shadow-lg w-full max-w-5xl min-h-[70vh] flex flex-col lg:flex-row gap-4 p-4">

        {/* Friend Requests & Friends List */}
        <div className="w-full lg:w-1/3 border border-base-300 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Friend Requests</h2>
          {receivedRequests?.length > 0 ? (
            receivedRequests.map((request) => (
              <div key={request._id} className="flex items-center justify-between p-3 hover:bg-base-300 rounded-lg">
                <span className="truncate max-w-[150px]">{request.fullName}</span>
                <div className="flex gap-2">
                  <button
                    className="btn btn-sm btn-success"
                    onClick={() => handleAction(acceptFriendRequest, `Accept friend request from ${request.fullName}?`, request._id)}
                  >
                    <CheckCircle className="size-4" />
                  </button>
                  <button
                    className="btn btn-sm btn-error"
                    onClick={() => handleAction(rejectFriendRequest, `Reject friend request from ${request.fullName}?`, request._id)}
                  >
                    <XCircle className="size-4" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No pending requests</p>
          )}

          <h2 className="text-lg font-semibold mt-6 mb-4">Your Friends</h2>
          {friends?.length > 0 ? (
            friends.map((friend) => (
              <div key={friend._id} className="flex items-center justify-between p-3 hover:bg-base-300 rounded-lg">
                <span className="truncate max-w-[150px]">{friend.fullName}</span>
                <button
                  className="btn btn-sm btn-error"
                  onClick={() => handleAction(removeFriend, `Remove ${friend.fullName} from your friends?`, friend._id)}
                >
                  <UserMinus className="size-4" />
                </button>
              </div>
            ))
          ) : (
            <p className="text-gray-500">You have no friends yet</p>
          )}
        </div>

        {/* Search Section */}
        <div className="w-full lg:w-2/3 border border-base-300 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Find Friends</h2>
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Search for users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input input-bordered w-full pl-10"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-base-content/40" />
          </div>

          {isSearchingUsers ? (
            <p className="text-gray-500 text-center">Loading...</p>
          ) : searchResults.length > 0 ? (
            searchResults.map((user) => {
              const isFriend = friends.some((friend) => friend._id === user._id);
              const hasSentRequest = sentRequests.some((req) => req._id === user._id);

              return (
                <div key={user._id} className="flex items-center justify-between p-3 hover:bg-base-300 rounded-lg">
                  <span className="truncate max-w-[150px]">{user.fullName}</span>
                  {!isFriend && (hasSentRequest ? (
                    <button
                      className="btn btn-sm btn-neutral"
                      onClick={() => handleAction(cancelFriendRequest, `Cancel friend request to ${user.fullName}?`, user._id)}
                    >
                      Cancel Request
                    </button>
                  ) : (
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => handleAction(sendFriendRequest, `Send friend request to ${user.fullName}?`, user._id)}
                    >
                      <UserPlus className="size-4" />
                    </button>
                  ))}
                </div>
              );
            })
          ) : searchQuery.trim().length === 0 ? (
            <p className="text-gray-500 text-center">Start typing to search for friends.</p>
          ) : null}
        </div>

      </div>
    </div>
  );
};

export default AddFriends;
