import { expect } from "./chai-setup";
import { setupOperatorFilter } from "./fixtures";

describe("AssetERC1155.sol", function () {
  describe("AssetERC1155: operator filterer", function () {
    it("should be registered", async function () {
      const { operatorFilterRegistry, assetERC721 } =
        await setupOperatorFilter();
      expect(
        await operatorFilterRegistry.isRegistered(assetERC721.address)
      ).to.be.equal(true);
    });
    it("should be subscribed to operator filterer subscription contract", async function () {
      const {
        operatorFilterRegistry,
        assetERC721,
        operatorFilterSubscription,
      } = await setupOperatorFilter();
      expect(
        await operatorFilterRegistry.subscriptionOf(assetERC721.address)
      ).to.be.equal(operatorFilterSubscription.address);
    });
    it("should be able to transfer token from owner", async function () {
      const { operatorFilterRegistry, users, assetERC721 } =
        await setupOperatorFilter();
      await assetERC721.mint(users[0].address);
      expect(await assetERC721.balanceOf(users[0].address)).to.be.equal(1);
      await users[0].assetERC721.transferFrom(
        users[0].address,
        users[1].address,
        1
      );
      expect(await assetERC721.balanceOf(users[1].address)).to.be.equal(1);
    });

    it("it should not approve blacklisted market places", async function () {
      const { mockMarketPlace1, users, assetERC721 } =
        await setupOperatorFilter();
      expect(assetERC721.setApprovalForAll(mockMarketPlace1.address, true)).to
        .be.reverted;
    });

    it("it should approve non blacklisted market place", async function () {
      const { mockMarketPlace2, users, assetERC721 } =
        await setupOperatorFilter();
      await users[0].assetERC721.setApprovalForAll(
        mockMarketPlace2.address,
        true
      );
      expect(
        await assetERC721.isApprovedForAll(
          users[0].address,
          mockMarketPlace2.address
        )
      ).to.be.equal(true);
    });
    it("should be able to transfer if from is owner of token and to is blacklisted Market place", async function () {
      const { mockMarketPlace1, assetERC721, users } =
        await setupOperatorFilter();
      await assetERC721.mint(users[0].address);
      await users[0].assetERC721.transferFrom(
        users[0].address,
        mockMarketPlace1.address,
        1
      );
      expect(await assetERC721.balanceOf(mockMarketPlace1.address)).to.be.equal(
        1
      );
    });

    it("should be able to transfer through non blacklisted market place", async function () {
      const { mockMarketPlace2, assetERC721, users } =
        await setupOperatorFilter();
      assetERC721.mint(users[0].address);
      expect(await assetERC721.balanceOf(users[0].address)).to.be.equal(1);
      users[0].assetERC721.setApprovalForAll(mockMarketPlace2.address, true);
      await mockMarketPlace2.transferTokenForERC721(
        assetERC721.address,
        users[0].address,
        users[1].address,
        1
      );
      expect(await assetERC721.balanceOf(users[1].address)).to.be.equal(1);
    });
    it("should not be able to transfer through blacklisted marketplace", async function () {
      const { mockMarketPlace1, assetERC721, users } =
        await setupOperatorFilter();
      assetERC721.mint(users[0].address);
      expect(
        users[0].assetERC721.approve(mockMarketPlace1.address, 1)
      ).to.be.revertedWith("Address is filtered");
    });
    it("should not be able to approve non blacklisted market place after it is blacklisted", async function () {
      const {
        mockMarketPlace2,
        operatorFilterRegistry,
        operatorFilterRegistryAsOwner,
        operatorFilterSubscription,
        assetERC721,
        users,
      } = await setupOperatorFilter();
      await users[0].assetERC721.setApprovalForAll(
        mockMarketPlace2.address,
        true
      );
      expect(
        await assetERC721.isApprovedForAll(
          users[0].address,
          mockMarketPlace2.address
        )
      ).to.be.equal(true);

      await operatorFilterRegistryAsOwner.updateOperator(
        operatorFilterSubscription.address,
        mockMarketPlace2.address,
        true
      );
      // console.log(
      //   await operatorFilterRegistry.filteredOperators(assetERC721.address)
      // );
      expect(
        users[1].assetERC721.setApprovalForAll(mockMarketPlace2.address, true)
      ).to.be.revertedWith("Address is filtered");
    });

    it("should not be able to transfer through market place after they are blacklisted", async function () {
      const {
        mockMarketPlace2,
        operatorFilterRegistryAsOwner,
        operatorFilterSubscription,
        assetERC721,
        users,
      } = await setupOperatorFilter();
      await assetERC721.mint(users[0].address);
      await assetERC721.mint(users[0].address);
      expect(await assetERC721.balanceOf(users[0].address)).to.be.equal(2);
      await users[0].assetERC721.approve(mockMarketPlace2.address, 1);
      expect(await assetERC721.getApproved(1)).to.be.equal(
        mockMarketPlace2.address
      );
      await mockMarketPlace2.transferTokenForERC721(
        assetERC721.address,
        users[0].address,
        users[1].address,
        1
      );
      expect(await assetERC721.ownerOf(1)).to.be.equal(users[1].address);
      await operatorFilterRegistryAsOwner.updateOperator(
        operatorFilterSubscription.address,
        mockMarketPlace2.address,
        true
      );
      expect(
        mockMarketPlace2.transferTokenForERC721(
          assetERC721.address,
          users[0].address,
          users[1].address,
          2
        )
      ).to.be.revertedWith("Address is filtered");
    });

    it("should be able to transfer through marketplace after they are removed form blacklist ", async function () {
      const {
        mockMarketPlace2,
        operatorFilterRegistryAsOwner,
        operatorFilterSubscription,
        assetERC721,
        users,
      } = await setupOperatorFilter();
      await assetERC721.mint(users[0].address);
      await assetERC721.mint(users[0].address);
      expect(await assetERC721.balanceOf(users[0].address)).to.be.equal(2);

      await users[0].assetERC721.setApprovalForAll(
        mockMarketPlace2.address,
        true
      );
      await operatorFilterRegistryAsOwner.updateOperator(
        operatorFilterSubscription.address,
        mockMarketPlace2.address,
        true
      );
      expect(
        mockMarketPlace2.transferTokenForERC721(
          assetERC721.address,
          users[0].address,
          users[1].address,
          1
        )
      ).to.be.revertedWith("Address is filtered");
      await operatorFilterRegistryAsOwner.updateOperator(
        operatorFilterSubscription.address,
        mockMarketPlace2.address,
        false
      );
      mockMarketPlace2.transferTokenForERC721(
        assetERC721.address,
        users[0].address,
        users[1].address,
        1
      );
      expect(await assetERC721.balanceOf(users[1].address)).to.be.equal(1);
    });
  });
});
