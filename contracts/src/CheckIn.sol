// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title Neon Diner — daily on-chain check-in for Base (gas only; no ETH sent).
contract CheckIn {
    /// @dev Raw storage: `0` = never checked in; otherwise `calendarDay + 1` where `calendarDay = block.timestamp / 1 days`.
    mapping(address => uint256) private lastCheckInEncoded;

    /// @notice Consecutive daily check-ins; resets if a calendar day is skipped.
    mapping(address => uint256) public streak;

    event CheckedIn(address indexed user, uint256 indexed day, uint256 streak);

    error AlreadyCheckedInToday();
    error ValueNotAllowed();

    /// @notice Calendar day index of last check-in (`0` if never).
    function lastCheckInDay(address user) external view returns (uint256) {
        uint256 enc = lastCheckInEncoded[user];
        if (enc == 0) return 0;
        return enc - 1;
    }

    /// @notice One successful check-in per UTC calendar day per address. Caller pays L2 gas only.
    function checkIn() external payable {
        if (msg.value != 0) revert ValueNotAllowed();

        uint256 today = block.timestamp / 1 days;
        uint256 enc = lastCheckInEncoded[msg.sender];

        if (enc != 0 && enc - 1 == today) revert AlreadyCheckedInToday();

        uint256 prevCal = enc == 0 ? type(uint256).max : enc - 1;
        if (enc == 0) {
            streak[msg.sender] = 1;
        } else if (today == prevCal + 1) {
            streak[msg.sender] += 1;
        } else {
            streak[msg.sender] = 1;
        }

        lastCheckInEncoded[msg.sender] = today + 1;
        emit CheckedIn(msg.sender, today, streak[msg.sender]);
    }

    function canCheckInToday(address user) external view returns (bool) {
        uint256 today = block.timestamp / 1 days;
        uint256 enc = lastCheckInEncoded[user];
        if (enc == 0) return true;
        return enc - 1 != today;
    }
}
