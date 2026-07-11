$(document).ready(function () {
   // Create traffic light HTML
    const trafficLight = `
        <div id="trafficLightContainer" style="
            width: 80px;
            padding: 10px;
            background: #222;
            border-radius: 10px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 10px;
        ">
            <div class="light red" style="
                width: 50px;
                height: 50px;
                background: #440000;
                border-radius: 50%;
                transition: background 0.3s;
            "></div>

            <div class="light yellow" style="
                width: 50px;
                height: 50px;
                background: #444400;
                border-radius: 50%;
                transition: background 0.3s;
            "></div>

            <div class="light green" style="
                width: 50px;
                height: 50px;
                background: #004400;
                border-radius: 50%;
                transition: background 0.3s;
            "></div>
        </div>
    `;

    // Inject into your target div
    $("#extendedContentRenderer").html(trafficLight);

    // Traffic light controller
    window.setTrafficLight = function (state) {
        // Reset all lights to "off"
        $(".light.red").css("background", "#440000");
        $(".light.yellow").css("background", "#444400");
        $(".light.green").css("background", "#004400");

        // Turn on selected light
        if (state === "red") $(".light.red").css("background", "red");
        if (state === "yellow") $(".light.yellow").css("background", "yellow");
        if (state === "green") $(".light.green").css("background", "limegreen");
    };

    // Example: start with red
    setTrafficLight("red");
  
})
}
