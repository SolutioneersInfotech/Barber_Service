 
const { sendGeneralResponse } = require('../utils/responseHelper');

const addsUrl = [
    'https://images.pexels.com/photos/2899097/pexels-photo-2899097.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
    'https://images.pexels.com/photos/213780/pexels-photo-213780.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
    'https://images.pexels.com/photos/2820884/pexels-photo-2820884.jpeg?auto=compress&cs=tinysrgb&dpr=1&w=500',
    'https://docs.flutter.dev/assets/images/dash/dash-fainting.gif',
    'https://picsum.photos/250?image=9',
    'https://flutter.github.io/assets-for-api-docs/assets/widgets/owl-2.jpg',
    'https://flutter.github.io/assets-for-api-docs/assets/widgets/owl.jpg',
    'https://blog.ippon.fr/content/images/2023/09/RGFzaGF0YXJfRGV2ZWxvcGVyX092ZXJJdF9jb2xvcl9QR19zaGFkb3c-.png',
    'https://picsum.photos/seed/picsum/200/300',
    'https://picsum.photos/200/300?grayscale',
    'https://picsum.photos/200/300?random=1',
    'https://picsum.photos/200/300?random=2',
  ];

const getAdds = (req, res) => {

    return sendGeneralResponse(res, true, "add images", 200 ,addsUrl);
  };

  module.exports=getAdds;