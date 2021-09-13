<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="//cdnjs.cloudflare.com/ajax/libs/font-awesome/4.2.0/css/font-awesome.min.css" rel="stylesheet" type="text/css" /> <!-- TODO: Localizing the icons. -->
    <link rel="stylesheet" href="/css/mui.min.css" type="text/css" />
    <link rel="stylesheet" href="/css/style.css" type="text/css" />
    <title>{{ page.title }}</title>
  </head>
  <body>
    <div id="sidedrawer" class="mui--no-user-select">
        <div id="sidedrawer-brand" class="mui--appbar-line-height">
            <span class="mui--text-title">Frequencer</span>
        </div>
        <div class="mui-divider"></div>
        <ul class="subjects">
            <li>
                <a style="color: #000;text-decoration: none" href="/"><strong>Home</strong></a>
            </li>
        </ul>
        <div class="mui-divider"></div>
        <ul>
            <li>
                <a style="color: #000;text-decoration: none" href="/add_subject"><strong>Add a subject</strong></a>
            </li>
        </ul>
    </div>
    <header id="header">
        <div class="mui-appbar mui--appbar-line-height">
            <div class="mui-container-fluid">
                <!-- <a class="sidedrawer-toggle mui--visible-xs-inline-block mui--visible-sm-inline-block js-show-sidedrawer">=</a> -->
                <!-- <a class="sidedrawer-toggle mui--hidden-xs mui--hidden-sm js-hide-sidedrawer">=</a> -->
                <!-- <span class="mui--text-title mui--visible-xs-inline-block">{{ page.title }}</span> -->
                {{ page.title }}
                <a href="#" style="color: #F00;" onclick="reset_database()"><i class="fa fa-trash" aria-hidden="false"></i></a>
            </div>
        </div>
    </header>
    <div class="mui--appbar-height"></div>
    <div id="content-wrapper">
        <div class="mui-container-fluid">{{ page.body|safe }}</div>
    </div>
    <footer id="footer">
        <div class="mui-container-fluid"><br>
            &lt;<span style="color: green;">/</span>&gt; with <span style="color: red">&lt;3</span> by <a target='_blank' href="https://github.com/naryal2580/">Captain Nick Lucifer*  (*pronounced Lu-cipher)</a>
        </div>
    </footer>
    <script src="/js/mui.min.js"></script>
    <script src="/js/yokto.min.js"></script>
    <script src="/js/main.js"></script>
    <script>{{ page.script|safe  }}</script>
  </body>
</html>
