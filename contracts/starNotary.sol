pragma solidity ^0.4.23;

import 'openzeppelin-solidity/contracts/token/ERC721/ERC721.sol';

contract StarNotary is ERC721 {

    struct Star {
        string name;
    }


//  Add a name and a symbol for your starNotary tokens
    string public constant name = "Star Notary";
    string public constant symbol = "SNY";
//

    mapping(uint256 => Star) public tokenIdToStarInfo;
    mapping(uint256 => uint256) public starsForSale;

    function createStar(string _name, uint256 _tokenId) public {
        Star memory newStar = Star(_name);

        tokenIdToStarInfo[_tokenId] = newStar;

        _mint(msg.sender, _tokenId);
    }

// Add a function lookUptokenIdToStarInfo, that looks up the stars using the Token ID, and then returns the name of the star.
    function lookUptokenIdToStarInfo(uint _starId) public view returns(string) {
        return tokenIdToStarInfo[_starId].name;
    }
//

    function putStarUpForSale(uint256 _tokenId, uint256 _price) public {
        require(ownerOf(_tokenId) == msg.sender);

        starsForSale[_tokenId] = _price;
    }

    function buyStar(uint256 _tokenId) public payable {
        require(starsForSale[_tokenId] > 0);

        uint256 starCost = starsForSale[_tokenId];
        address starOwner = ownerOf(_tokenId);
        require(msg.value >= starCost);

        _removeTokenFrom(starOwner, _tokenId);
        _addTokenTo(msg.sender, _tokenId);

        starOwner.transfer(starCost);

        if(msg.value > starCost) {
            msg.sender.transfer(msg.value - starCost);
        }
        starsForSale[_tokenId] = 0;
      }

// Add a function called exchangeStars, so 2 users can exchange their star tokens...
//Do not worry about the price, just write code to exchange stars between users.
    function exchangeStars(
        address _user1,
        address _user2,
        uint256 _tokenId1,
        uint256 _tokenId2)
    public {
        require(ownerOf(_tokenId1) == _user1);
        require(ownerOf(_tokenId2) == _user2);
        safeTransferFrom(_user1, _user2, _tokenId1);
        safeTransferFrom(_user2, _user1, _tokenId2);
    }

//
// Write a function to Transfer a Star. The function should transfer a star from the address of the caller.
// The function should accept 2 arguments, the address to transfer the star to, and the token ID of the star.
//

function transferStar(address _to, uint _tokenId) public  {
    require(ownerOf(_tokenId) == msg.sender);
    require(_to != address(0x0));
    safeTransferFrom(msg.sender, _to, _tokenId);

}

}
