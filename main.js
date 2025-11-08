export default function page() {
    var updatingStatus = false;

    $(document).ready(function () {
        $(".tabsBar div").click(function (x) {
            var src = $(x.currentTarget);
            var tabName = src.attr("id");

            $(".tabContent:not(." + tabName + ")").hide();
            $(".tabContent." + tabName).show();
            $(".tabsBar div:not(." + tabName + ")").removeClass("active");
            src.addClass("active");

        })

    });



    function updateStatus() {
        if (updatingStatus) {
            return;
        }
        $("#status").show();
        fetch('http://esp32dev.local/status', { 
            method: 'GET', 
            mode: 'cors', 
            credentials: 'omit', 
            headers: { 
                'Content-Type': 'application/json'                
            }
        })
            .then(r => r.json()).then(data => {
                document.getElementById('status').innerHTML =
                    'Stepper Pos: ' + data.stepperPos + '<br>' +
                    'Stepper Desired Pos: ' + data.stepperDesiredPos + '<br>' +
                    'Encoder Position: ' + data.encoderPosition + '<br>' +
                    'Kp: ' + data.Kp + '<br>' +
                    'Ki: ' + data.Ki + '<br>' +
                    'Kd: ' + data.Kd + '<br>' +
                    'IP: ' + data.ip + '<br>' +
                    'Ver: ' + data.ver;
                updatingStatus = false;
                $("#status").hide();
            }, () => {
                updatingStatus = false;
                $("#status").hide();
            });
        updatingStatus = true;
    }
    setInterval(updateStatus, 5000);
    updateStatus();


}



