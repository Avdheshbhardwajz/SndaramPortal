import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { RowRequestManager as OriginalRowRequestManager } from '@/components/RowRequestManager';

const RowRequestManager: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className='font-poppins'>Row Requests</CardTitle>
      </CardHeader>
      <CardContent>
        <OriginalRowRequestManager />
      </CardContent>
    </Card>
  );
};

export default RowRequestManager;

