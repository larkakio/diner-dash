// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console} from "forge-std/Test.sol";
import {CheckIn} from "../src/CheckIn.sol";

contract CheckInTest is Test {
    CheckIn public c;
    address alice = address(0xA11CE);

    function setUp() public {
        c = new CheckIn();
    }

    function test_RevertWhenSendingEth() public {
        vm.expectRevert(CheckIn.ValueNotAllowed.selector);
        c.checkIn{value: 1 wei}();
    }

    function test_CheckInOncePerDay() public {
        vm.startPrank(alice);
        assertTrue(c.canCheckInToday(alice));
        c.checkIn();
        assertFalse(c.canCheckInToday(alice));

        vm.expectRevert(CheckIn.AlreadyCheckedInToday.selector);
        c.checkIn();
        vm.stopPrank();
    }

    function test_CheckInNextDay() public {
        vm.startPrank(alice);
        c.checkIn();
        assertEq(c.streak(alice), 1);

        uint256 nextDay = block.timestamp + 1 days;
        vm.warp(nextDay);
        assertTrue(c.canCheckInToday(alice));
        c.checkIn();
        assertEq(c.streak(alice), 2);
        vm.stopPrank();
    }

    function test_StreakResetsAfterGap() public {
        vm.startPrank(alice);
        c.checkIn();
        assertEq(c.streak(alice), 1);

        vm.warp(block.timestamp + 3 days);
        c.checkIn();
        assertEq(c.streak(alice), 1);
        vm.stopPrank();
    }

    function test_Event() public {
        vm.startPrank(alice);
        uint256 today = block.timestamp / 1 days;
        vm.expectEmit(true, true, true, true);
        emit CheckIn.CheckedIn(alice, today, 1);
        c.checkIn();
        vm.stopPrank();
    }
}
