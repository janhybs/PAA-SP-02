var longPressIntID = null;
var swipeDownPosition = null;
var swipeDownTarget = null;

function registerAdvancedListeners (elements) {
    if (elements === false)
        return;
    
    if (!elements.length)
        return registerAdvancedListeners ([elements]);

    var element;
    for (var i = 0, l = elements.length; i < l; i++) {
        element = elements[i];
        element.addEventListener ('mouseup', function (event) {
            event.preventDefault ();
            clearTimeout (longPressIntID);
            if (swipeDownTarget === this) {
                var
                        x = Math.abs (swipeDownPosition.x - event.x),
                        y = Math.abs (swipeDownPosition.y - event.y);
                if (x > 100 && x > y * 3) {
                    this.dispatchEvent (
                            new CustomEvent ("horizontalswipe",
                            {
                                bubbles: true,
                                cancelable: false
                            }));
                }
                swipeDownTarget = null;
                swipeDownPosition = null;
            }
        }, false);

        element.addEventListener ('mousedown', function (event) {
            event.preventDefault ();
            clearTimeout (longPressIntID);
            swipeDownPosition = {x: event.x, y: event.y};
            swipeDownTarget = this;
            longPressIntID = setTimeout (function (target) {
                target.dispatchEvent (
                        new CustomEvent ("longpress",
                        {
                            bubbles: true,
                            cancelable: false
                        }));
            }, 500, this);
        });
    }

    return;
}