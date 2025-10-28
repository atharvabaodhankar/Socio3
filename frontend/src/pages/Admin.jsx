import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { useContracts } from '../hooks/useContracts';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../config/firebase';
import { getReportTypeName } from '../services/reportService';

const Admin = () => {
  const { account, isConnected } = useWeb3();
  const { getReportCount } = useContracts();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReports: 0,
    pendingReports: 0,
    removedPosts: 0
  });

  // Simple admin check (in production, this should be more secure)
  const isAdmin = account && account.toLowerCase() === '0xf5caf845421a211d2326f3ba04fb99ed0f75b8465'.toLowerCase();

  useEffect(() => {
    if (isConnected && isAdmin) {
      fetchReports();
    }
  }, [isConnected, isAdmin]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      
      // Fetch reports from Firebase
      const reportsQuery = query(
        collection(db, 'reports'),
        orderBy('timestamp', 'desc'),
        limit(50)
      );
      
      const reportsSnapshot = await getDocs(reportsQuery);
      const reportsData = [];
      
      reportsSnapshot.forEach((doc) => {
        reportsData.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setReports(reportsData);
      
      // Calculate stats
      const totalReports = reportsData.length;
      const pendingReports = reportsData.filter(r => r.status === 'pending').length;
      
      setStats({
        totalReports,
        pendingReports,
        removedPosts: 0 // TODO: Get from smart contract
      });
      
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-2xl font-bold mb-4">Connect Wallet</h2>
        <p className="text-gray-400">Connect your wallet to access the admin dashboard.</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <p className="text-gray-400">You don't have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-white/60 text-lg">Monitor reports and manage content moderation</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.totalReports}</p>
              <p className="text-white/60">Total Reports</p>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.pendingReports}</p>
              <p className="text-white/60">Pending Review</p>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.removedPosts}</p>
              <p className="text-white/60">Posts Removed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">Recent Reports</h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white/60">Loading reports...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-white/60">No reports found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Post ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Reporter</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-white/5">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      #{report.postId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
                        {report.reportTypeName || getReportTypeName(report.reportType)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white/60">
                      {report.reporterAddress?.slice(0, 6)}...{report.reporterAddress?.slice(-4)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white/60">
                      {report.timestamp?.toDate ? report.timestamp.toDate().toLocaleDateString() : 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        report.status === 'pending' 
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : report.status === 'resolved'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {report.status || 'pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;