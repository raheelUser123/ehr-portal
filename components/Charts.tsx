'use client';import {ResponsiveContainer,AreaChart,Area,XAxis,YAxis,Tooltip,CartesianGrid,BarChart,Bar} from 'recharts';
const trend=[{m:'Apr',notes:134},{m:'May',notes:166},{m:'Jun',notes:158},{m:'Jul',notes:205},{m:'Aug',notes:228},{m:'Sep',notes:246}];
const docs=[{n:'Progress',v:42},{n:'MAR',v:36},{n:'Assessments',v:27},{n:'Incidents',v:8},{n:'Discharge',v:11}];
export function DocumentationTrend(){return <ResponsiveContainer width="100%" height="100%"><AreaChart data={trend}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="m"/><YAxis/><Tooltip/><Area type="monotone" dataKey="notes" stroke="#0f9aa8" fill="#0f9aa833" strokeWidth={3}/></AreaChart></ResponsiveContainer>}
export function DocsBar(){return <ResponsiveContainer width="100%" height="100%"><BarChart data={docs}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="n"/><YAxis/><Tooltip/><Bar dataKey="v" fill="#4abfc8" radius={[8,8,0,0]}/></BarChart></ResponsiveContainer>}
