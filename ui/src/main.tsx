// Copyright 2020 Datafuse Labs.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";
import "antd/dist/antd.css";
import "./main.scss";
import { AppRouters } from "./router";

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <React.Suspense fallback={<>...</>}>
        <AppRouters />
      </React.Suspense>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);
