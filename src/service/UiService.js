
class UiService {
    setUpDownArrowClass(prdy_vrss_sign) {
        if(prdy_vrss_sign == 1 || prdy_vrss_sign == 2) {
            return 'icon-up'
        }

        if(prdy_vrss_sign == 4 || prdy_vrss_sign == 5) {
            return 'icon-down'
        }

        return '';
    }

    setColorClass(prdy_vrss_sign) {
        if(prdy_vrss_sign == 1 || prdy_vrss_sign == 2) {
            return 'red'
        }

        if(prdy_vrss_sign == 4 || prdy_vrss_sign == 5) {
            return 'blue'
        }

        return '';
    }

    setColorStyle(prdy_vrss_sign) {
        if(prdy_vrss_sign == 1 || prdy_vrss_sign == 2) {
            return 'color : red;'
        }

        if(prdy_vrss_sign == 4 || prdy_vrss_sign == 5) {
            return 'color: blue'
        }

        return '';
    }

    isMobile() {
        const info = navigator.userAgent;
        let flag = false;

        if (info.indexOf("iPhone") > -1
            || info.indexOf("Android") > -1
            || info.indexOf("iPad") > -1
            || info.indexOf("iPod") > -1
        ) {
            flag = true;
        }
        return flag;
    }

    isMobileFont() {
        if (this.isMobile()) {
            return 'font-size: 10px;'
        } else {
            return '';
        }
    }

    replaceStockImg(e) {
        let arr = e.target.src.split('/');
        let fileName = arr[arr.length -1];
        let logo = new Image();
        logo.onload = function () {
            e.target.src = 'https://stock.hws.pe.kr/logo/'.concat(fileName);
        };

        logo.onerror = function() {
            e.target.src = './bank-icons/default-bank.png';
        }

        logo.src = 'https://stock.hws.pe.kr/logo/'.concat(fileName);

    }
}
export default new UiService();