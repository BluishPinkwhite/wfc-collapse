
// @author Tammie Hladilů
// 21.11.2023


window.wallpaperPropertyListener = {
    applyUserProperties: function(properties) {
        if (properties.backgroundcolor) {
            // Convert the custom color to 0 - 255 range for CSS usage
            let backgroundColor = properties.backgroundcolor.value.split(' ');
            backgroundColor = backgroundColor.map(function(c) {
                return Math.ceil(c * 255);
            });
            let backgroundColorAsCSS = 'rgb(' + backgroundColor + ')';

            config.backgroundColor = backgroundColorAsCSS;
            document.body.backgroundColor = backgroundColorAsCSS;
        }

        if(properties.chancecolor) {
            let chanceColor = properties.chancecolor.value.split(' ');
            chanceColor = chanceColor.map(function(c) {
                return Math.ceil(c * 255);
            });
            let chanceColorAsCSS = 'rgb(' + chanceColor + ')';

            config.chanceColor = chanceColorAsCSS;
        }

        if (properties.speed) {
            let value = properties.speed.value;

            config.speed = value;
            restartInterval();
        }

        if (properties.countdownmax) {
            let value = properties.countdownmax.value;

            config.countdownMax = value;
        }
        

        if (properties.tilerows) {
            let value = properties.tilerows.value;

            config.height = value;
            start();
        }
        

        if (properties.tilecolumns) {
            let value = properties.tilecolumns.value;

            config.width = value;
            start();
        }
    },
};