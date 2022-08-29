const { expect } = require("chai");

describe("Token Contract", function() {
    let Token;
    let token;
    let owner;
    let addr1;
    let addr2;
    let addr3;

    beforeEach(async function () {
        Token = await ethers.getContractFactory("MyToken");
        [owner, addr1, addr2, addr3] = await ethers.getSigners();

        token = await Token.deploy();
    });

    describe("Transfers", function () {
        it("Owner Balance after Minting is the Supply", async function () {
            const tokenBalance = await token.balanceOf(owner.address);
            expect(hre.ethers.utils.formatEther(tokenBalance)).to.equal("1000000.0");
        });
        it("Transfers between users changes balance", async function () {
            await token.connect(owner).transfer(addr1.address, hre.ethers.utils.parseEther("1000"));
            const ownerTokenBalance = await token.balanceOf(owner.address);
            const addr1TokenBalance = await token.balanceOf(addr1.address);
            expect(hre.ethers.utils.formatEther(ownerTokenBalance)).to.equal("999000.0");
            expect(hre.ethers.utils.formatEther(addr1TokenBalance)).to.equal("1000.0");
        });
        it("Cannot transfer tokens if you don't own enough", async function () {
            // Code
            await expect(token.connect(owner).transfer(addr1.address, hre.ethers.utils.parseEther("1000001"))).to.be.revertedWith("ERC20: transfer amount exceeds balance");
        });
    });

    describe("Approvals", function () {
        beforeEach(async function () {
            await token.connect(owner).transfer(addr1.address, hre.ethers.utils.parseEther("1000"));
        });

        it("Allow approvals to any account", async function () {
            const canApproveAddr1 = await token.connect(owner).approve(addr1.address, 1000);
            const canApproveAddr2 = await token.connect(owner).approve(addr2.address, 1000);
            const canApproveAddr3 = await token.connect(owner).approve(addr3.address, 1000);
            expect(canApproveAddr1).to.emit(token, "Approve")
            expect(canApproveAddr2).to.emit(token, "Approve")
            expect(canApproveAddr3).to.emit(token, "Approve")
        });
        it("A user can approve token it does not own", async function () {
            const canApproveAddr3 = await token.connect(addr2).approve(addr3.address, 1000);
            expect(canApproveAddr3).to.emit(token, "Approve")
        });
        it("A user with approved tokens can send tokens", async function () {
            await token.connect(owner).approve(addr1.address, hre.ethers.utils.parseEther("500"));
            await token.connect(addr1).transfer(addr2.address, hre.ethers.utils.parseEther("500"));
            const addr1TokenBalance = await token.balanceOf(addr1.address);
            const addr2TokenBalance = await token.balanceOf(addr2.address);
            expect(hre.ethers.utils.formatEther(addr1TokenBalance)).to.equal("500.0");
            expect(hre.ethers.utils.formatEther(addr2TokenBalance)).to.equal("500.0");
        });
        it("Random users cannot transferFrom unapproved tokens", async function () {
            //await token.connect(addr1).transfer(addr1.address, addr2.address, hre.ethers.utils.parseEther("500"));
        });
    });

    describe("Burning and minting", function () {
        it("Burning tokens decreases the supply", async function () {
            await token.connect(owner).burn(hre.ethers.utils.parseEther("500000"))
            const tokenSupply = await token.totalSupply();
            expect(hre.ethers.utils.formatEther(tokenSupply)).to.equal("500000.0");
        });
        it("Minting tokens increases the supply", async function () {
            await token.connect(owner).mint(owner.address, hre.ethers.utils.parseEther("500000"))
            const tokenSupply = await token.totalSupply();
            expect(hre.ethers.utils.formatEther(tokenSupply)).to.equal("1500000.0");
        });
        it("Only the Owner can mint tokens", async function () {
            await expect(token.connect(addr1).mint(owner.address, hre.ethers.utils.parseEther("500000"))).to.be.revertedWith("Ownable: caller is not the owner");
        });
        it("Anyone can burn tokens", async function () {
            await token.connect(owner).transfer(addr1.address, hre.ethers.utils.parseEther("1000"));
            await token.connect(addr1).burn(hre.ethers.utils.parseEther("500"));
            const addr1TokenBalance = await token.balanceOf(addr1.address);
            expect(hre.ethers.utils.formatEther(addr1TokenBalance)).to.equal("500.0");
            const tokenSupply = await token.totalSupply();
            expect(hre.ethers.utils.formatEther(tokenSupply)).to.equal("999500.0");
        });
        it("Cannot burn more tokens than you own", async function () {
            await token.connect(owner).transfer(addr1.address, hre.ethers.utils.parseEther("1000"));
            await expect(token.connect(addr1).burn(hre.ethers.utils.parseEther("1500"))).to.be.revertedWith("ERC20: burn amount exceeds balance");
        });
    });
})