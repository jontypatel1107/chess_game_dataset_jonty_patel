import{j as r,C as u}from"./index-CGWtbK7z.js";const p=({children:s,type:a="button",variant:o="primary",size:i="md",isLoading:e=!1,disabled:n=!1,onClick:l,className:c="",fullWidth:d=!1,icon:t})=>{const g="inline-flex items-center justify-center font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg",m={primary:"bg-primary text-white hover:bg-primary-dark focus:ring-primary",secondary:"bg-secondary text-white hover:bg-secondary-dark focus:ring-secondary",outline:"border-2 border-primary text-primary hover:bg-primary hover:text-white focus:ring-primary",ghost:"text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 focus:ring-gray-500",danger:"bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"},y={sm:"px-3 py-1.5 text-sm",md:"px-4 py-2 text-base",lg:"px-6 py-3 text-lg"};return r.jsxs("button",{type:a,onClick:l,disabled:n||e,className:`
        ${g} 
        ${m[o]} 
        ${y[i]} 
        ${d?"w-full":""} 
        ${c}
      `,children:[e?r.jsx(u,{size:20,color:"inherit",className:"mr-2"}):t?r.jsx(t,{className:"mr-2 h-5 w-5"}):null,s]})};export{p as B};
